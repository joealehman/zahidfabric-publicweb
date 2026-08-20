export type BusinessConfig = {
  businessName: string;
  whatsappNumber: string;
  phone: string;
  email: string;
  address: string;
  facebook: string;
  instagram: string;
};

export const defaultBusinessConfig: BusinessConfig = {
  businessName: 'Zahid Fabric',
  whatsappNumber: '923001234567',
  phone: '0300-1234567',
  email: 'zahidfabric@example.com',
  address: 'Karachi, Pakistan',
  facebook: 'https://www.facebook.com/zahid.fabric.2025/',
  instagram: '',
};

export const CONFIG_KEY = 'zahid_fabric_config_v1';

export function loadBusinessConfig(): BusinessConfig {
  try {
    const raw = sessionStorage.getItem(CONFIG_KEY);
    if (raw) return { ...defaultBusinessConfig, ...JSON.parse(raw) };
  } catch { /* ignore */ }
  return defaultBusinessConfig;
}

export function saveBusinessConfig(config: BusinessConfig): void {
  try {
    sessionStorage.setItem(CONFIG_KEY, JSON.stringify(config));
  } catch { /* ignore */ }
}

export function buildWhatsAppLink(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
