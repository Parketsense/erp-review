#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Configuration
const DB_PATH = './prisma/dev.db';
const BACKUP_DIR = './backups';
const RETENTION_DAYS = 30;

/**
 * 🔄 PARKETSENSE ERP - Database Backup Script
 * Създава автоматичен бекъп на SQLite базата данни
 */

function createBackup() {
  try {
    console.log('🚀 Започвам бекъп на базата данни...');
    
    // Проверка дали базата данни съществува
    if (!fs.existsSync(DB_PATH)) {
      console.error('❌ Грешка: Базата данни не съществува:', DB_PATH);
      process.exit(1);
    }
    
    // Създаване на backup директория
    if (!fs.existsSync(BACKUP_DIR)) {
      fs.mkdirSync(BACKUP_DIR, { recursive: true });
      console.log('📁 Създадена backup директория:', BACKUP_DIR);
    }
    
    // Генериране на име за backup
    const timestamp = new Date().toISOString()
      .replace(/[:.]/g, '-')
      .slice(0, 19);
    const backupName = `parketsense-backup-${timestamp}.db`;
    const backupPath = path.join(BACKUP_DIR, backupName);
    
    // Копиране на базата данни
    fs.copyFileSync(DB_PATH, backupPath);
    
    // Проверка на размера
    const stats = fs.statSync(backupPath);
    const sizeKB = Math.round(stats.size / 1024);
    
    console.log('✅ Бекъп създаден успешно!');
    console.log(`📂 Файл: ${backupPath}`);
    console.log(`📏 Размер: ${sizeKB} KB`);
    console.log(`⏰ Дата: ${new Date().toLocaleString('bg-BG')}`);
    
    // Почистване на стари backup-и
    cleanOldBackups();
    
    return backupPath;
    
  } catch (error) {
    console.error('❌ Грешка при създаване на бекъп:', error.message);
    process.exit(1);
  }
}

function cleanOldBackups() {
  try {
    const files = fs.readdirSync(BACKUP_DIR);
    const backupFiles = files.filter(file => file.startsWith('parketsense-backup-') && file.endsWith('.db'));
    
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - RETENTION_DAYS);
    
    let deletedCount = 0;
    
    backupFiles.forEach(file => {
      const filePath = path.join(BACKUP_DIR, file);
      const stats = fs.statSync(filePath);
      
      if (stats.mtime < cutoffDate) {
        fs.unlinkSync(filePath);
        deletedCount++;
        console.log(`🗑️ Изтрит стар бекъп: ${file}`);
      }
    });
    
    if (deletedCount > 0) {
      console.log(`🧹 Почистени ${deletedCount} стари бекъп(а)`);
    }
    
    console.log(`📊 Общо бекъпи: ${backupFiles.length - deletedCount}`);
    
  } catch (error) {
    console.warn('⚠️ Предупреждение при почистване на стари бекъпи:', error.message);
  }
}

function listBackups() {
  try {
    if (!fs.existsSync(BACKUP_DIR)) {
      console.log('📁 Няма създадени бекъпи още.');
      return;
    }
    
    const files = fs.readdirSync(BACKUP_DIR);
    const backupFiles = files.filter(file => file.startsWith('parketsense-backup-') && file.endsWith('.db'));
    
    if (backupFiles.length === 0) {
      console.log('📁 Няма намерени бекъпи.');
      return;
    }
    
    console.log(`📋 Намерени ${backupFiles.length} бекъп(а):`);
    console.log('');
    
    backupFiles
      .sort()
      .reverse()
      .forEach((file, index) => {
        const filePath = path.join(BACKUP_DIR, file);
        const stats = fs.statSync(filePath);
        const sizeKB = Math.round(stats.size / 1024);
        const date = stats.mtime.toLocaleString('bg-BG');
        
        console.log(`${index + 1}. ${file}`);
        console.log(`   📅 ${date} | 📏 ${sizeKB} KB`);
        console.log('');
      });
      
  } catch (error) {
    console.error('❌ Грешка при списване на бекъпи:', error.message);
  }
}

// Command line interface
const command = process.argv[2];

switch (command) {
  case 'create':
  case undefined:
    createBackup();
    break;
    
  case 'list':
    listBackups();
    break;
    
  case 'help':
    console.log(`
🔄 PARKETSENSE ERP - Database Backup Tool

Използване:
  node scripts/db-backup.js [command]

Команди:
  create (default)  Създава нов бекъп
  list             Показва всички бекъпи  
  help             Показва тази помощ

Примери:
  npm run db:backup           # Създава бекъп
  node scripts/db-backup.js list  # Показва бекъпи
`);
    break;
    
  default:
    console.error(`❌ Неизвестна команда: ${command}`);
    console.log('Използвай "help" за повече информация.');
    process.exit(1);
} 