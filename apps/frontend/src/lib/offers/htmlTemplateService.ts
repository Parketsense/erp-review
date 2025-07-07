/**
 * HTML Template Service for Offer Generation
 * Handles loading, processing, and serving HTML offer templates
 */

export interface OfferTemplateData {
  clientName: string;
  projectName: string;
  projectAddress?: string;
  offerNumber: string;
  offerDate: string;
  validUntil: string;
  totalValue: number;
  variants: Array<{
    id: string;
    name: string;
    description?: string;
    totalPrice: number;
    rooms: Array<{
      id: string;
      name: string;
      totalPrice: number;
      products: Array<{
        id: string;
        name: string;
        quantity: number;
        unitPrice: number;
        discount: number;
        totalPrice: number;
      }>;
    }>;
  }>;
  installationPhase?: {
    id: string;
    name: string;
    description?: string;
  };
  terms: string[];
  emailTemplate?: string;
}

export interface TemplateConfig {
  id: string;
  name: string;
  description: string;
  filename: string;
  category: 'luxury' | 'standard' | 'installation' | 'advanced';
}

export const AVAILABLE_TEMPLATES: TemplateConfig[] = [
  {
    id: 'luxury',
    name: 'Luxury Premium',
    description: 'Премиум дизайн за луксозни проекти',
    filename: 'luxury_offer_preview.html',
    category: 'luxury'
  },
  {
    id: 'installation',
    name: 'Монтажни услуги',
    description: 'Специализиран за монтажни проекти',
    filename: 'montazh_offer_screen.html',
    category: 'installation'
  },
  {
    id: 'advanced',
    name: 'Интерактивна оферта',
    description: 'Модерен дизайн с интерактивни елементи',
    filename: 'parketsense_advanced_offer (1).html',
    category: 'advanced'
  }
];

class HTMLTemplateService {
  private templateCache: Map<string, string> = new Map();

  /**
   * Load HTML template from public directory
   */
  async loadTemplate(templateId: string): Promise<string> {
    // Check cache first
    if (this.templateCache.has(templateId)) {
      return this.templateCache.get(templateId)!;
    }

    const template = AVAILABLE_TEMPLATES.find(t => t.id === templateId);
    if (!template) {
      throw new Error(`Template ${templateId} not found`);
    }

    try {
      const response = await fetch(`/templates/offers/${template.filename}`);
      if (!response.ok) {
        throw new Error(`Failed to load template: ${response.statusText}`);
      }

      const htmlContent = await response.text();
      
      // Cache the template
      this.templateCache.set(templateId, htmlContent);
      
      return htmlContent;
    } catch (error) {
      console.error('Error loading template:', error);
      throw new Error(`Failed to load template ${templateId}: ${error}`);
    }
  }

  /**
   * Replace placeholders in HTML template with actual data
   */
  replacePlaceholders(htmlContent: string, data: OfferTemplateData): string {
    let processedHtml = htmlContent;

    // Basic replacements
    const replacements: Record<string, string> = {
      '{{CLIENT_NAME}}': data.clientName || 'Неизвестен клиент',
      '{{PROJECT_NAME}}': data.projectName || 'Неизвестен проект',
      '{{PROJECT_ADDRESS}}': data.projectAddress || 'Няма адрес',
      '{{OFFER_NUMBER}}': data.offerNumber || 'N/A',
      '{{OFFER_DATE}}': this.formatDate(data.offerDate),
      '{{VALID_UNTIL}}': this.formatDate(data.validUntil),
      '{{TOTAL_VALUE}}': this.formatCurrency(data.totalValue),
      '{{COMPANY_NAME}}': 'PARKETSENSE',
      '{{COMPANY_PHONE}}': '+359 2 123 4567',
      '{{COMPANY_EMAIL}}': 'office@parketsense.bg',
      '{{COMPANY_WEBSITE}}': 'www.parketsense.bg'
    };

    // Apply basic replacements
    Object.entries(replacements).forEach(([placeholder, value]) => {
      processedHtml = processedHtml.replace(new RegExp(placeholder, 'g'), value);
    });

    // Generate variants HTML
    const variantsHtml = this.generateVariantsHtml(data.variants);
    processedHtml = processedHtml.replace('{{VARIANTS_SECTION}}', variantsHtml);

    // Generate variants grid for interactive template
    const variantsGridHtml = this.generateVariantsGridHtml(data.variants);
    processedHtml = processedHtml.replace('{{VARIANTS_GRID}}', variantsGridHtml);

    // Generate variant details for interactive template
    const variantDetailsHtml = this.generateVariantDetailsHtml(data.variants);
    processedHtml = processedHtml.replace('{{VARIANT_DETAILS}}', variantDetailsHtml);

    // Add installation pricing placeholders
    const firstVariant = data.variants[0];
    if (firstVariant) {
      const totalArea = this.calculateTotalArea(firstVariant);
      const standardPrice = this.calculateStandardInstallation(totalArea);
      const premiumPrice = this.calculatePremiumInstallation(totalArea);
      
      processedHtml = processedHtml.replace('{{STANDARD_PRICE}}', this.formatCurrency(standardPrice));
      processedHtml = processedHtml.replace('{{PREMIUM_PRICE}}', this.formatCurrency(premiumPrice));
    }

    // Generate terms HTML
    const termsHtml = this.generateTermsHtml(data.terms);
    processedHtml = processedHtml.replace('{{TERMS_SECTION}}', termsHtml);

    // Generate installation section if available
    if (data.installationPhase) {
      const installationHtml = this.generateInstallationHtml(data.installationPhase);
      processedHtml = processedHtml.replace('{{INSTALLATION_SECTION}}', installationHtml);
    } else {
      processedHtml = processedHtml.replace('{{INSTALLATION_SECTION}}', '');
    }

    // Generate project data JSON for interactive template
    const projectDataJson = this.generateProjectDataJson(data);
    processedHtml = processedHtml.replace('{{PROJECT_DATA_JSON}}', projectDataJson);

    return processedHtml;
  }

  /**
   * Generate JSON data for interactive offer template
   */
  private generateProjectDataJson(data: OfferTemplateData): string {
    const projectData = {
      projectName: data.projectName,
      clientName: data.clientName,
      variants: this.generateInteractiveVariantsData(data.variants),
      totalArea: this.calculateProjectTotalArea(data.variants),
      galleryData: this.generateGalleryData(data.variants)
    };

    return JSON.stringify(projectData, null, 2);
  }

  /**
   * Generate interactive variants data with installation options
   */
  private generateInteractiveVariantsData(variants: OfferTemplateData['variants']): Record<string, any> {
    const interactiveVariants: Record<string, any> = {};

    variants.forEach((variant, index) => {
      const variantId = (index + 1).toString();
      const materialsCost = this.calculateVariantMaterialsCost(variant);
      const totalArea = this.calculateTotalArea(variant);

      interactiveVariants[variantId] = {
        name: variant.name,
        materialsCost: materialsCost,
        totalArea: totalArea,
        rooms: variant.rooms?.map(room => ({
          name: room.name,
          totalPrice: room.totalPrice,
          area: this.calculateRoomArea(room),
          products: room.products?.map(product => ({
            name: product.name,
            quantity: product.quantity,
            unitPrice: product.unitPrice,
            totalPrice: product.totalPrice
          })) || []
        })) || [],
        installationOptions: {
          basic: {
            name: "Без монтаж",
            price: 0,
            description: "Само доставка на материалите. Монтажът се извършва от ваш екип."
          },
          standard: {
            name: "Стандартен монтаж",
            price: this.calculateStandardInstallation(totalArea),
            description: "Професионален монтаж от сертифицирани специалисти с 2 години гаранция."
          },
          premium: {
            name: "Премиум монтаж",
            price: this.calculatePremiumInstallation(totalArea),
            description: "Включва подготовка на основата, монтаж, финишни работи и 3 години гаранция."
          }
        }
      };
    });

    return interactiveVariants;
  }

  /**
   * Calculate standard installation price
   */
  private calculateStandardInstallation(totalArea: number): number {
    // Base price: 15 лв/м² for standard installation
    return Math.round(totalArea * 15);
  }

  /**
   * Calculate premium installation price
   */
  private calculatePremiumInstallation(totalArea: number): number {
    // Base price: 25 лв/м² for premium installation
    return Math.round(totalArea * 25);
  }

  /**
   * Calculate total project area
   */
  private calculateProjectTotalArea(variants: OfferTemplateData['variants']): number {
    return variants.reduce((total, variant) => {
      return total + this.calculateTotalArea(variant);
    }, 0);
  }

  /**
   * Generate gallery data for interactive features
   */
  private generateGalleryData(variants: OfferTemplateData['variants']): any {
    const galleries: Record<string, any> = {};

    variants.forEach((variant, variantIndex) => {
      const variantId = (variantIndex + 1).toString();
      galleries[variantId] = {};

      variant.rooms?.forEach((room, roomIndex) => {
        const roomId = `${variantId}_${roomIndex + 1}`;
        galleries[variantId][roomId] = {
          name: room.name,
          images: [
            { id: 1, title: `Вдъхновение ${room.name}`, description: "Дизайн идеи" },
            { id: 2, title: "Паркет образци", description: "Материали" },
            { id: 3, title: "Цветова гама", description: "Варианти" }
          ]
        };
      });
    });

    return galleries;
  }

  /**
   * Calculate total materials cost for a variant
   */
  private calculateVariantMaterialsCost(variant: OfferTemplateData['variants'][0]): number {
    if (!variant.rooms) return 0;
    
    return variant.rooms.reduce((total, room) => {
      if (!room.products) return total;
      return total + room.products.reduce((roomTotal, product) => {
        return roomTotal + product.totalPrice;
      }, 0);
    }, 0);
  }

  /**
   * Calculate total area for a variant
   */
  private calculateTotalArea(variant: OfferTemplateData['variants'][0]): number {
    if (!variant.rooms) return 0;
    
    return variant.rooms.reduce((total, room) => {
      return total + this.calculateRoomArea(room);
    }, 0);
  }

  /**
   * Calculate area for a room
   */
  private calculateRoomArea(room: OfferTemplateData['variants'][0]['rooms'][0]): number {
    if (!room.products) return 0;
    
    return room.products.reduce((total, product) => {
      return total + product.quantity;
    }, 0);
  }

  /**
   * Generate HTML for variants section
   */
  private generateVariantsHtml(variants: OfferTemplateData['variants']): string {
    if (!variants || variants.length === 0) {
      return '<p class="no-variants">Няма избрани варианти</p>';
    }

    return variants.map((variant, index) => {
      const roomCount = variant.rooms?.length || 0;
      const totalProducts = variant.rooms?.reduce((sum, room) => sum + (room.products?.length || 0), 0) || 0;
      
      return `
        <div class="variant-card">
          <div class="variant-header">
            <h3 class="variant-name">${variant.name}</h3>
            <div class="variant-meta">
              <span class="variant-number">Вариант ${index + 1}</span>
              <span class="variant-stats">${roomCount} стаи • ${totalProducts} продукта</span>
            </div>
          </div>
          ${variant.description ? `<p class="variant-description">${variant.description}</p>` : ''}
          <div class="variant-content">
            ${this.generateRoomsHtml(variant.rooms)}
          </div>
          <div class="variant-footer">
            <div class="variant-total">
              <span class="total-label">Обща стойност на варианта:</span>
              <span class="total-amount">${this.formatCurrency(variant.totalPrice)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Generate HTML for variants grid in interactive template
   */
  private generateVariantsGridHtml(variants: OfferTemplateData['variants']): string {
    if (!variants || variants.length === 0) {
      return '<p class="no-variants">Няма избрани варианти</p>';
    }

    return variants.map((variant, index) => {
      const variantId = index + 1;
      const isSelected = index === 0; // First variant is selected by default
      const materialsCost = this.calculateVariantMaterialsCost(variant);
      const totalArea = this.calculateTotalArea(variant);
      const standardInstallation = Math.round(totalArea * 15); // 15 лв/м²
      const subtotal = materialsCost + standardInstallation;
      const vat = subtotal * 0.2;
      const total = subtotal + vat;

      return `
        <div class="variant-summary ${isSelected ? 'selected' : ''}" onclick="selectVariant(${variantId})" data-variant="${variantId}">
          <div class="variant-name">Вариант ${variantId}: ${variant.name}</div>
          <div class="variant-description">${variant.description || 'Професионален паркет с гарантирано качество'}</div>
          <div class="variant-total-price" id="variant${variantId}-total">${this.formatCurrency(total)}</div>
          <div class="variant-total-label" id="variant${variantId}-label">с ДДС и стандартен монтаж</div>
        </div>
      `;
    }).join('');
  }

  /**
   * Generate HTML for variant details in interactive template
   */
  private generateVariantDetailsHtml(variants: OfferTemplateData['variants']): string {
    if (!variants || variants.length === 0) {
      return '<p class="no-variants">Няма избрани варианти</p>';
    }

    return variants.map((variant, index) => {
      const variantId = index + 1;
      const isActive = index === 0; // First variant is active by default
      
      return `
        <div class="variant-details ${isActive ? 'active' : ''}" id="variant${variantId}-details">
          <h2 class="section-title">📋 Детайли - Вариант ${variantId}: ${variant.name}</h2>
          
          <div class="rooms-grid">
            ${this.generateInteractiveRoomsHtml(variant.rooms, variantId)}
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Generate HTML for rooms in interactive template
   */
  private generateInteractiveRoomsHtml(rooms: OfferTemplateData['variants'][0]['rooms'], variantId: number): string {
    if (!rooms || rooms.length === 0) {
      return '<p class="no-rooms">Няма стаи в този вариант</p>';
    }

    return rooms.map((room, roomIndex) => {
      const roomArea = this.calculateRoomArea(room);
      const roomIcon = this.getRoomIcon(room.name);
      
      return `
        <div class="room-card">
          <div class="room-header">
            <div class="room-name">${roomIcon} ${room.name}</div>
            <div class="room-meta">
              <span>📐 ${roomArea.toFixed(1)} м²</span>
              <span>💰 ${this.calculateRoomDiscount(room)}% отстъпка</span>
              <span>📊 10% фира</span>
            </div>
          </div>
          
          <div class="room-content">
            ${this.generateInteractiveProductsTable(room.products)}
            
            <div class="gallery-section">
              <div class="gallery-title">📸 Галерия - ${room.name}</div>
              <div class="gallery-grid">
                <div class="gallery-item" onclick="openGallery('room${variantId}_${roomIndex + 1}', 1)">
                  <div class="gallery-placeholder">Вдъхновение<br>${room.name.toLowerCase()}</div>
                </div>
                <div class="gallery-item" onclick="openGallery('room${variantId}_${roomIndex + 1}', 2)">
                  <div class="gallery-placeholder">Паркет<br>образци</div>
                </div>
                <div class="gallery-item" onclick="openGallery('room${variantId}_${roomIndex + 1}', 3)">
                  <div class="gallery-placeholder">Цветова<br>гама</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Generate interactive products table
   */
  private generateInteractiveProductsTable(products: OfferTemplateData['variants'][0]['rooms'][0]['products']): string {
    if (!products || products.length === 0) {
      return '<p class="no-products">Няма продукти в тази стая</p>';
    }

    return `
      <table class="products-table">
        <thead>
          <tr>
            <th>Продукт</th>
            <th>Количество</th>
            <th>Ед. цена</th>
            <th>Отстъпка</th>
            <th>Обща сума</th>
          </tr>
        </thead>
        <tbody>
          ${products.map(product => `
            <tr>
              <td class="product-name">${product.name}</td>
              <td>${product.quantity.toFixed(1)} м²</td>
              <td>${this.formatCurrency(product.unitPrice)}/м²</td>
              <td>${product.discount > 0 ? `<span class="discount-badge">${product.discount}% отстъпка</span>` : '-'}</td>
              <td><strong>${this.formatCurrency(product.totalPrice)}</strong></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    `;
  }

  /**
   * Get room icon based on room name
   */
  private getRoomIcon(roomName: string): string {
    const roomNameLower = roomName.toLowerCase();
    if (roomNameLower.includes('дневна') || roomNameLower.includes('living')) return '🏠';
    if (roomNameLower.includes('спалня') || roomNameLower.includes('bedroom')) return '🛏️';
    if (roomNameLower.includes('кухня') || roomNameLower.includes('kitchen')) return '🍳';
    if (roomNameLower.includes('баня') || roomNameLower.includes('bathroom')) return '🚿';
    if (roomNameLower.includes('коридор') || roomNameLower.includes('hallway')) return '🚪';
    if (roomNameLower.includes('офис') || roomNameLower.includes('office')) return '💼';
    return '🏠';
  }

  /**
   * Calculate room discount percentage
   */
  private calculateRoomDiscount(room: OfferTemplateData['variants'][0]['rooms'][0]): number {
    if (!room.products || room.products.length === 0) return 0;
    
    const totalDiscount = room.products.reduce((sum, product) => sum + product.discount, 0);
    return Math.round(totalDiscount / room.products.length);
  }

  /**
   * Generate HTML for rooms within a variant
   */
  private generateRoomsHtml(rooms: OfferTemplateData['variants'][0]['rooms']): string {
    if (!rooms || rooms.length === 0) {
      return '<p class="no-rooms">Няма стаи в този вариант</p>';
    }

    return rooms.map((room, index) => {
      const productCount = room.products?.length || 0;
      const totalArea = room.products?.reduce((sum, product) => sum + product.quantity, 0) || 0;
      
      return `
        <div class="room-section">
          <div class="room-header">
            <h4 class="room-name">${room.name}</h4>
            <div class="room-meta">
              <span class="room-number">Стая ${index + 1}</span>
              <span class="room-stats">${productCount} продукта • ${totalArea.toFixed(1)} м²</span>
            </div>
          </div>
          <div class="room-content">
            ${this.generateProductsHtml(room.products)}
          </div>
          <div class="room-footer">
            <div class="room-total">
              <span class="total-label">Обща стойност на стаята:</span>
              <span class="total-amount">${this.formatCurrency(room.totalPrice)}</span>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  /**
   * Generate HTML for products within a room
   */
  private generateProductsHtml(products: OfferTemplateData['variants'][0]['rooms'][0]['products']): string {
    if (!products || products.length === 0) {
      return '<p class="no-products">Няма продукти в тази стая</p>';
    }

    // Calculate totals for this room
    const subtotal = products.reduce((sum, product) => sum + (product.quantity * product.unitPrice), 0);
    const totalDiscount = products.reduce((sum, product) => sum + (product.quantity * product.unitPrice * (product.discount / 100)), 0);
    const total = products.reduce((sum, product) => sum + product.totalPrice, 0);

    return `
      <div class="products-section">
        <table class="products-table">
          <thead>
            <tr>
              <th>Продукт</th>
              <th>Количество</th>
              <th>Мярка</th>
              <th>Ед. цена</th>
              <th>Отстъпка</th>
              <th>Обща сума</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(product => `
              <tr>
                <td class="product-name">${product.name}</td>
                <td class="product-quantity">${product.quantity}</td>
                <td class="product-unit">м²</td>
                <td class="product-price">${this.formatCurrency(product.unitPrice)}</td>
                <td class="product-discount">${product.discount > 0 ? `${product.discount}%` : '-'}</td>
                <td class="product-total">${this.formatCurrency(product.totalPrice)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="room-summary">
          <div class="summary-row">
            <span>Междинна сума:</span>
            <span>${this.formatCurrency(subtotal)}</span>
          </div>
          ${totalDiscount > 0 ? `
            <div class="summary-row discount">
              <span>Отстъпка:</span>
              <span>-${this.formatCurrency(totalDiscount)}</span>
            </div>
          ` : ''}
          <div class="summary-row total">
            <span>Обща сума за стаята:</span>
            <span>${this.formatCurrency(total)}</span>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Generate HTML for terms section
   */
  private generateTermsHtml(terms: string[]): string {
    if (!terms || terms.length === 0) {
      return '<p>Няма зададени условия</p>';
    }

    return `
      <ul class="terms-list">
        ${terms.map(term => `<li>${term}</li>`).join('')}
      </ul>
    `;
  }

  /**
   * Generate HTML for installation section
   */
  private generateInstallationHtml(installation: OfferTemplateData['installationPhase']): string {
    if (!installation) return '';

    return `
      <div class="installation-section">
        <div class="installation-header">
          <h3>Монтажни услуги</h3>
          <div class="installation-icon">🔧</div>
        </div>
        <div class="installation-content">
          <h4>${installation.name}</h4>
          ${installation.description ? `<p class="installation-description">${installation.description}</p>` : ''}
          ${(installation as any).price ? `
            <div class="installation-price">
              <span class="price-label">Цена за монтаж:</span>
              <span class="price-amount">${this.formatCurrency((installation as any).price)}</span>
            </div>
          ` : ''}
        </div>
      </div>
    `;
  }

  /**
   * Format date for display
   */
  private formatDate(dateString: string): string {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('bg-BG');
    } catch {
      return dateString;
    }
  }

  /**
   * Format currency for display
   */
  private formatCurrency(amount: number): string {
    return `${amount.toLocaleString('bg-BG')} лв.`;
  }

  /**
   * Generate HTML offer with data
   */
  async generateOfferHtml(templateId: string, data: OfferTemplateData): Promise<string> {
    const template = await this.loadTemplate(templateId);
    return this.replacePlaceholders(template, data);
  }

  /**
   * Create blob URL for HTML preview/download
   */
  async createHtmlBlobUrl(templateId: string, data: OfferTemplateData): Promise<string> {
    const htmlContent = await this.generateOfferHtml(templateId, data);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    return URL.createObjectURL(blob);
  }

  /**
   * Download HTML offer as file
   */
  async downloadHtmlOffer(templateId: string, data: OfferTemplateData, filename?: string): Promise<void> {
    const htmlContent = await this.generateOfferHtml(templateId, data);
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `offer_${data.offerNumber}_${templateId}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
  }

  /**
   * Open HTML offer in new window/tab
   */
  async openHtmlPreview(templateId: string, data: OfferTemplateData): Promise<void> {
    const url = await this.createHtmlBlobUrl(templateId, data);
    const newWindow = window.open(url, '_blank', 'width=1200,height=800,scrollbars=yes,resizable=yes');
    
    if (newWindow) {
      // Clean up blob URL after window loads
      newWindow.onload = () => {
        setTimeout(() => URL.revokeObjectURL(url), 1000);
      };
    }
  }

  /**
   * Get available templates
   */
  getAvailableTemplates(): TemplateConfig[] {
    return AVAILABLE_TEMPLATES;
  }

  /**
   * Get template by ID
   */
  getTemplateById(templateId: string): TemplateConfig | undefined {
    return AVAILABLE_TEMPLATES.find(t => t.id === templateId);
  }
}

// Export singleton instance
export const htmlTemplateService = new HTMLTemplateService();
export default htmlTemplateService; 