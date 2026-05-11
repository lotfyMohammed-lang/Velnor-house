export interface Area {
  id: string;
  nameEn: string;
  nameAr: string;
}

export interface City {
  id: string;
  nameEn: string;
  nameAr: string;
  areas: Area[];
}

export interface Governorate {
  id: string;
  nameEn: string;
  nameAr: string;
  cities: City[];
}

export const EGYPT_LOCATIONS: Governorate[] = [
  {
    id: 'cairo',
    nameEn: 'Cairo',
    nameAr: 'القاهرة',
    cities: [
      {
        id: 'new-cairo',
        nameEn: 'New Cairo',
        nameAr: 'القاهرة الجديدة',
        areas: [
          { id: 'fifth-settlement', nameEn: 'Fifth Settlement', nameAr: 'التجمع الخامس' },
          { id: 'first-settlement', nameEn: 'First Settlement', nameAr: 'التجمع الأول' },
          { id: 'rehab-city', nameEn: 'Rehab City', nameAr: 'مدينة الرحاب' },
          { id: 'madinaty', nameEn: 'Madinaty', nameAr: 'مدينتي' },
        ],
      },
      {
        id: 'nasr-city',
        nameEn: 'Nasr City',
        nameAr: 'مدينة نصر',
        areas: [
          { id: 'first-district', nameEn: 'First District', nameAr: 'الحي الأول' },
          { id: 'seventh-district', nameEn: 'Seventh District', nameAr: 'الحي السابع' },
          { id: 'makram-ebeid', nameEn: 'Makram Ebeid', nameAr: 'مكرم عبيد' },
          { id: 'abbas-el-akkad', nameEn: 'Abbas El Akkad', nameAr: 'عباس العقاد' },
        ],
      },
      {
        id: 'maadi',
        nameEn: 'Maadi',
        nameAr: 'المعادي',
        areas: [
          { id: 'old-maadi', nameEn: 'Old Maadi', nameAr: 'المعادي القديمة' },
          { id: 'new-maadi', nameEn: 'New Maadi', nameAr: 'المعادي الجديدة' },
          { id: 'degla', nameEn: 'Degla', nameAr: 'دجلة' },
        ],
      },
      {
        id: 'heliopolis',
        nameEn: 'Heliopolis',
        nameAr: 'مصر الجديدة',
        areas: [
          { id: 'korba', nameEn: 'Korba', nameAr: 'الكوربة' },
          { id: 'gesr-el-suez', nameEn: 'Gesr El Suez', nameAr: 'جسر السويس' },
          { id: 'santom-fatima', nameEn: 'Santom Fatima', nameAr: 'سانت فاطيما' },
        ],
      },
    ],
  },
  {
    id: 'giza',
    nameEn: 'Giza',
    nameAr: 'الجيزة',
    cities: [
      {
        id: 'october-6',
        nameEn: '6th of October',
        nameAr: '٦ أكتوبر',
        areas: [
          { id: 'first-district', nameEn: 'First District', nameAr: 'الحي الأول' },
          { id: 'fourth-district', nameEn: 'Fourth District', nameAr: 'الحي الرابع' },
          { id: 'sheikh-zayed', nameEn: 'Sheikh Zayed', nameAr: 'الشيخ زايد' },
        ],
      },
      {
        id: 'dokki',
        nameEn: 'Dokki',
        nameAr: 'الدقي',
        areas: [
          { id: 'mossadak', nameEn: 'Mossadak', nameAr: 'مصدق' },
          { id: 'tahrir-st', nameEn: 'Tahrir St', nameAr: 'شارع التحرير' },
        ],
      },
      {
        id: 'mohandessin',
        nameEn: 'Mohandessin',
        nameAr: 'المهندسين',
        areas: [
          { id: 'gameat-el-dowal', nameEn: 'Gameat El Dowal', nameAr: 'جامعة الدول' },
          { id: 'shehab-st', nameEn: 'Shehab St', nameAr: 'شارع شهاب' },
        ],
      },
      {
        id: 'haram',
        nameEn: 'Haram',
        nameAr: 'الهرم',
        areas: [
          { id: 'faisal', nameEn: 'Faisal', nameAr: 'فيصل' },
          { id: 'marioutia', nameEn: 'Marioutia', nameAr: 'المريوطية' },
        ],
      },
    ],
  },
  {
    id: 'alexandria',
    nameEn: 'Alexandria',
    nameAr: 'الإسكندرية',
    cities: [
      {
        id: 'east-alex',
        nameEn: 'East Alexandria',
        nameAr: 'شرق الإسكندرية',
        areas: [
          { id: 'smouha', nameEn: 'Smouha', nameAr: 'سموحة' },
          { id: 'sidi-gaber', nameEn: 'Sidi Gaber', nameAr: 'سيدي جابر' },
          { id: 'kafr-abdu', nameEn: 'Kafr Abdu', nameAr: 'كفر عبده' },
        ],
      },
      {
        id: 'central-alex',
        nameEn: 'Central Alexandria',
        nameAr: 'وسط الإسكندرية',
        areas: [
          { id: 'mansheya', nameEn: 'Mansheya', nameAr: 'المنشية' },
          { id: 'raml-station', nameEn: 'Raml Station', nameAr: 'محطة الرمل' },
        ],
      },
    ],
  },
];
