#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Configuration
const DB_PATH = './prisma/dev.db';
const BACKUP_DIR = './backups';

/**
 * 🔄 PARKETSENSE ERP - Database Restore Script
 * Възстановява базата данни от бекъп файл
 */

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(query) {
  return new Promise(resolve => rl.question(query, resolve));
}

async function restoreFromBackup(backupFile) {
  try {
    console.log('🔄 Започвам възстановяване на базата данни...');
    
    let backupPath;
    
    if (backupFile) {
      // Конкретен файл е подаден
      if (path.isAbsolute(backupFile)) {
        backupPath = backupFile;
      } else {
        backupPath = path.join(BACKUP_DIR, backupFile);
      }
    } else {
      // Избор от налични бекъпи
      backupPath = await selectBackup();
    }
    
    if (!backupPath) {
      console.log('❌ Операцията е отменена.');
      process.exit(0);
    }
    
    // Проверка дали бекъп файлът съществува
    if (!fs.existsSync(backupPath)) {
      console.error('❌ Грешка: Бекъп файлът не съществува:', backupPath);
      process.exit(1);
    }
    
    // Проверка на текущата база данни
    let currentDbExists = fs.existsSync(DB_PATH);
    if (currentDbExists) {
      const stats = fs.statSync(DB_PATH);
      const currentDate = stats.mtime.toLocaleString('bg-BG');
      const currentSize = Math.round(stats.size / 1024);
      
      console.log('⚠️ ВНИМАНИЕ: Ще се презапише текущата база данни!');
      console.log(`📅 Текуща база: ${currentDate} | 📏 ${currentSize} KB`);
      console.log('');
      
      const confirm = await question('Сигурен ли си, че искаш да продължиш? (да/не): ');
      if (confirm.toLowerCase() !== 'да' && confirm.toLowerCase() !== 'yes') {
        console.log('❌ Операцията е отменена.');
        rl.close();
        process.exit(0);
      }
      
      // Създаване на автоматичен бекъп преди възстановяване
      console.log('📂 Създавам автоматичен бекъп на текущата база...');
      const autoBackupName = `auto-backup-before-restore-${Date.now()}.db`;
      const autoBackupPath = path.join(BACKUP_DIR, autoBackupName);
      
      if (!fs.existsSync(BACKUP_DIR)) {
        fs.mkdirSync(BACKUP_DIR, { recursive: true });
      }
      
      fs.copyFileSync(DB_PATH, autoBackupPath);
      console.log(`✅ Автоматичен бекъп: ${autoBackupPath}`);
    }
    
    // Копиране на бекъп файла
    console.log('🔄 Възстановявам базата данни...');
    fs.copyFileSync(backupPath, DB_PATH);
    
    // Проверка на възстановената база
    const restoredStats = fs.statSync(DB_PATH);
    const restoredSize = Math.round(restoredStats.size / 1024);
    
    console.log('✅ Базата данни е възстановена успешно!');
    console.log(`📂 От: ${backupPath}`);
    console.log(`📏 Размер: ${restoredSize} KB`);
    console.log(`⏰ Възстановена на: ${new Date().toLocaleString('bg-BG')}`);
    
    console.log('');
    console.log('🔄 Препоръка: Стартирай "npm run db:seed" ако е нужно.');
    
  } catch (error) {
    console.error('❌ Грешка при възстановяване:', error.message);
    process.exit(1);
  } finally {
    rl.close();
  }
}

async function selectBackup() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('❌ Няма намерени бекъпи. Създай бекъп първо с "npm run db:backup"');
      return null;
    }
    
    const files = fs.readdirSync(BACKUP_DIR);
    const backupFiles = files.filter(file => file.endsWith('.db'));
    
    if (backupFiles.length === 0) {
      console.log('❌ Няма намерени бекъп файлове.');
      return null;
    }
    
    console.log('📋 Налични бекъпи:');
    console.log('');
    
    const backupsWithStats = backupFiles.map(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      return {
        file,
        path: filePath,
        date: stats.mtime,
        size: Math.round(stats.size / 1024)
      };
    });
    
    // Сортиране по дата (най-новите първо)
    backupsWithStats.sort((a, b) => b.date - a.date);
    
    backupsWithStats.forEach((backup, index) => {
      console.log(`${index + 1}. ${backup.file}`);
      console.log(`   📅 ${backup.date.toLocaleString('bg-BG')} | 📏 ${backup.size} KB`);
      console.log('');
    });
    
    const choice = await question(`Избери бекъп (1-${backupsWithStats.length}) или "0" за отказ: `);
    const choiceNum = parseInt(choice);
    
    if (choiceNum === 0 || isNaN(choiceNum)) {
      return null;
    }
    
    if (choiceNum < 1 || choiceNum > backupsWithStats.length) {
      console.log('❌ Невалиден избор.');
      return null;
    }
    
    return backupsWithStats[choiceNum - 1].path;
    
  } catch (error) {
    console.error('❌ Грешка при избор на бекъп:', error.message);
    return null;
  }
}

function showHelp() {
  console.log(`
🔄 PARKETSENSE ERP - Database Restore Tool

Използване:
  node scripts/db-restore.js [backup-file]

Параметри:
  backup-file    Път към бекъп файл (по избор)

Примери:
  npm run db:restore                           # Интерактивен избор
  npm run db:restore parketsense-backup-*.db  # Конкретен файл
  node scripts/db-restore.js list             # Покажи бекъпи

⚠️  ВНИМАНИЕ: Тази операция ще презапише текущата база данни!
`);
}

// Command line interface
const command = process.argv[2];

if (command === 'help') {
  showHelp();
  process.exit(0);
}

if (command === 'list') {
  // Преизползваме логиката от backup скрипта
  require('./db-backup.js');
  process.exit(0);
}

// Стартиране на възстановяването
restoreFromBackup(command); 