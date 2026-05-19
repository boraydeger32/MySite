// =============================================================================
// i18n Translation System
// =============================================================================
// Simple, lightweight translation system for the QR menu public pages.
// Supports Turkish (default) and English. Easily extensible to more languages.
// =============================================================================

export type Locale = 'tr' | 'en';

export const SUPPORTED_LOCALES: { code: Locale; label: string; flag: string }[] = [
  { code: 'tr', label: 'Turkce', flag: '🇹🇷' },
  { code: 'en', label: 'English', flag: '🇬🇧' },
];

export const DEFAULT_LOCALE: Locale = 'tr';

type TranslationKeys = {
  // Common
  'common.loading': string;
  'common.error': string;
  'common.save': string;
  'common.cancel': string;
  'common.delete': string;
  'common.edit': string;
  'common.add': string;
  'common.search': string;
  'common.filter': string;
  'common.all': string;
  'common.close': string;
  'common.confirm': string;
  'common.back': string;

  // Menu
  'menu.title': string;
  'menu.search_placeholder': string;
  'menu.no_results': string;
  'menu.allergens': string;
  'menu.calories': string;
  'menu.prep_time': string;
  'menu.prep_time_unit': string;
  'menu.add_to_cart': string;
  'menu.unavailable': string;
  'menu.popular': string;
  'menu.new': string;
  'menu.chef_pick': string;

  // Cart
  'cart.title': string;
  'cart.empty': string;
  'cart.empty_desc': string;
  'cart.total': string;
  'cart.submit': string;
  'cart.submitting': string;
  'cart.item_notes': string;
  'cart.remove': string;
  'cart.clear': string;

  // Order
  'order.success': string;
  'order.success_desc': string;
  'order.error': string;
  'order.error_desc': string;

  // Waiter
  'waiter.call': string;
  'waiter.calling': string;
  'waiter.called': string;
  'waiter.call_desc': string;

  // Allergens
  'allergen.gluten': string;
  'allergen.sut': string;
  'allergen.yumurta': string;
  'allergen.findik': string;
  'allergen.susam': string;
  'allergen.balik': string;
  'allergen.soya': string;
  'allergen.kereviz': string;

  // Reservation
  'reservation.title': string;
  'reservation.name': string;
  'reservation.phone': string;
  'reservation.email': string;
  'reservation.party_size': string;
  'reservation.date': string;
  'reservation.time': string;
  'reservation.notes': string;
  'reservation.submit': string;
  'reservation.success': string;
};

const tr: TranslationKeys = {
  'common.loading': 'Yukleniyor...',
  'common.error': 'Bir hata olustu',
  'common.save': 'Kaydet',
  'common.cancel': 'Iptal',
  'common.delete': 'Sil',
  'common.edit': 'Duzenle',
  'common.add': 'Ekle',
  'common.search': 'Ara',
  'common.filter': 'Filtrele',
  'common.all': 'Tumu',
  'common.close': 'Kapat',
  'common.confirm': 'Onayla',
  'common.back': 'Geri',

  'menu.title': 'Menu',
  'menu.search_placeholder': 'Menu\'de ara...',
  'menu.no_results': 'Sonuc bulunamadi',
  'menu.allergens': 'Alerjenler',
  'menu.calories': 'Kalori',
  'menu.prep_time': 'Hazirlanma Suresi',
  'menu.prep_time_unit': 'dk',
  'menu.add_to_cart': 'Sepete Ekle',
  'menu.unavailable': 'Mevcut Degil',
  'menu.popular': 'Populer',
  'menu.new': 'Yeni',
  'menu.chef_pick': 'Sef Onerisi',

  'cart.title': 'Sepetim',
  'cart.empty': 'Sepetiniz bos',
  'cart.empty_desc': 'Menudan urun ekleyerek baslayabilirsiniz.',
  'cart.total': 'Toplam',
  'cart.submit': 'Siparis Ver',
  'cart.submitting': 'Gonderiliyor...',
  'cart.item_notes': 'Not ekle...',
  'cart.remove': 'Kaldir',
  'cart.clear': 'Sepeti Temizle',

  'order.success': 'Siparisiniz alindi!',
  'order.success_desc': 'Afiyet olsun.',
  'order.error': 'Siparis gonderilemedi',
  'order.error_desc': 'Lutfen tekrar deneyin.',

  'waiter.call': 'Garson Cagir',
  'waiter.calling': 'Cagriliyor...',
  'waiter.called': 'Garson Cagrildi',
  'waiter.call_desc': 'Garson en kisa surede masaniza gelecektir.',

  'allergen.gluten': 'Gluten',
  'allergen.sut': 'Sut',
  'allergen.yumurta': 'Yumurta',
  'allergen.findik': 'Findik/Fistik',
  'allergen.susam': 'Susam',
  'allergen.balik': 'Balik/Deniz Urunleri',
  'allergen.soya': 'Soya',
  'allergen.kereviz': 'Kereviz',

  'reservation.title': 'Rezervasyon Yap',
  'reservation.name': 'Ad Soyad',
  'reservation.phone': 'Telefon',
  'reservation.email': 'E-posta',
  'reservation.party_size': 'Kisi Sayisi',
  'reservation.date': 'Tarih',
  'reservation.time': 'Saat',
  'reservation.notes': 'Notlar',
  'reservation.submit': 'Rezervasyon Yap',
  'reservation.success': 'Rezervasyonunuz alindi!',
};

const en: TranslationKeys = {
  'common.loading': 'Loading...',
  'common.error': 'An error occurred',
  'common.save': 'Save',
  'common.cancel': 'Cancel',
  'common.delete': 'Delete',
  'common.edit': 'Edit',
  'common.add': 'Add',
  'common.search': 'Search',
  'common.filter': 'Filter',
  'common.all': 'All',
  'common.close': 'Close',
  'common.confirm': 'Confirm',
  'common.back': 'Back',

  'menu.title': 'Menu',
  'menu.search_placeholder': 'Search menu...',
  'menu.no_results': 'No results found',
  'menu.allergens': 'Allergens',
  'menu.calories': 'Calories',
  'menu.prep_time': 'Prep Time',
  'menu.prep_time_unit': 'min',
  'menu.add_to_cart': 'Add to Cart',
  'menu.unavailable': 'Unavailable',
  'menu.popular': 'Popular',
  'menu.new': 'New',
  'menu.chef_pick': "Chef's Pick",

  'cart.title': 'My Cart',
  'cart.empty': 'Your cart is empty',
  'cart.empty_desc': 'Start by adding items from the menu.',
  'cart.total': 'Total',
  'cart.submit': 'Place Order',
  'cart.submitting': 'Submitting...',
  'cart.item_notes': 'Add a note...',
  'cart.remove': 'Remove',
  'cart.clear': 'Clear Cart',

  'order.success': 'Order placed!',
  'order.success_desc': 'Enjoy your meal.',
  'order.error': 'Order failed',
  'order.error_desc': 'Please try again.',

  'waiter.call': 'Call Waiter',
  'waiter.calling': 'Calling...',
  'waiter.called': 'Waiter Called',
  'waiter.call_desc': 'A waiter will be with you shortly.',

  'allergen.gluten': 'Gluten',
  'allergen.sut': 'Dairy',
  'allergen.yumurta': 'Eggs',
  'allergen.findik': 'Tree Nuts',
  'allergen.susam': 'Sesame',
  'allergen.balik': 'Fish/Seafood',
  'allergen.soya': 'Soy',
  'allergen.kereviz': 'Celery',

  'reservation.title': 'Make a Reservation',
  'reservation.name': 'Full Name',
  'reservation.phone': 'Phone',
  'reservation.email': 'Email',
  'reservation.party_size': 'Party Size',
  'reservation.date': 'Date',
  'reservation.time': 'Time',
  'reservation.notes': 'Notes',
  'reservation.submit': 'Book Table',
  'reservation.success': 'Reservation confirmed!',
};

const translations: Record<Locale, TranslationKeys> = { tr, en };

export type TranslationKey = keyof TranslationKeys;

export function t(locale: Locale, key: TranslationKey): string {
  return translations[locale]?.[key] ?? translations[DEFAULT_LOCALE][key] ?? key;
}

export function getTranslator(locale: Locale) {
  return (key: TranslationKey) => t(locale, key);
}
