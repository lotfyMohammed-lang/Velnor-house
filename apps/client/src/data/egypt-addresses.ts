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

export const EGYPT_ADDRESS_DATA: Governorate[] = [
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
          { id: 'first-settlement', nameEn: 'First Settlement', nameAr: 'التجمع الأول' },
          { id: 'third-settlement', nameEn: 'Third Settlement', nameAr: 'التجمع الثالث' },
          { id: 'fifth-settlement', nameEn: 'Fifth Settlement', nameAr: 'التجمع الخامس' },
          { id: 'rehab-city', nameEn: 'Rehab City', nameAr: 'الرحاب' },
          { id: 'madinaty', nameEn: 'Madinaty', nameAr: 'مدينتي' },
          { id: 'future-city', nameEn: 'Future City', nameAr: 'مدينة المستقبل' },
          { id: 'el-narges', nameEn: 'El Narges', nameAr: 'النرجس' },
          { id: 'el-yasmeen', nameEn: 'El Yasmeen', nameAr: 'الياسمين' },
          { id: 'el-banafseg', nameEn: 'El Banafseg', nameAr: 'البنفسج' },
          { id: 'south-academy', nameEn: 'South Academy', nameAr: 'جنوب الأكاديمية' },
          { id: 'north-academy', nameEn: 'North Academy', nameAr: 'شمال الأكاديمية' },
          { id: 'lotus-north', nameEn: 'North Lotus', nameAr: 'اللوتس الشمالية' },
          { id: 'lotus-south', nameEn: 'South Lotus', nameAr: 'اللوتس الجنوبية' },
          { id: 'andalus', nameEn: 'Andalus', nameAr: 'الأندلس' },
          { id: 'choueifat', nameEn: 'Choueifat', nameAr: 'الشويفات' },
        ],
      },
      {
        id: 'nasr-city',
        nameEn: 'Nasr City',
        nameAr: 'مدينة نصر',
        areas: [
          { id: 'makram-ebeid', nameEn: 'Makram Ebeid', nameAr: 'مكرم عبيد' },
          { id: 'abbas-el-akkad', nameEn: 'Abbas El Akkad', nameAr: 'عباس العقاد' },
          { id: 'mostafa-el-nahas', nameEn: 'Mostafa El Nahas', nameAr: 'مصطفى النحاس' },
          { id: 'zahraa-nasr-city', nameEn: 'Zahraa Nasr City', nameAr: 'زهراء مدينة نصر' },
          { id: 'seventh-district', nameEn: '7th District', nameAr: 'الحي السابع' },
          { id: 'eighth-district', nameEn: '8th District', nameAr: 'الحي الثامن' },
          { id: 'tenth-district', nameEn: '10th District', nameAr: 'الحي العاشر' },
          { id: 'rabaa', nameEn: 'Rabaa El Adaweya', nameAr: 'رابعة العدوية' },
          { id: 'tairan-street', nameEn: 'Tairan Street', nameAr: 'شارع الطيران' },
          { id: 'wafa-wa-amel', nameEn: 'Wafa W Amal', nameAr: 'الوفاء والأمل' },
          { id: 'hay-el-safarat', nameEn: 'Embassies District', nameAr: 'حي السفارات' },
        ],
      },
      {
        id: 'heliopolis',
        nameEn: 'Heliopolis',
        nameAr: 'مصر الجديدة',
        areas: [
          { id: 'korba', nameEn: 'Korba', nameAr: 'الكوربة' },
          { id: 'roxy', nameEn: 'Roxy', nameAr: 'روكسي' },
          { id: 'marghany', nameEn: 'Marghany', nameAr: 'الميرغني' },
          { id: 'sheraton', nameEn: 'Sheraton', nameAr: 'شيراتون' },
          { id: 'saint-fatima', nameEn: 'Saint Fatima', nameAr: 'سانت فاتيما' },
          { id: 'almaza', nameEn: 'Almazah', nameAr: 'ألماظة' },
          { id: 'el-nozha', nameEn: 'El Nozha', nameAr: 'النزهة' },
          { id: 'ard-el-golf', nameEn: 'Ard El Golf', nameAr: 'أرض الجولف' },
          { id: 'triumph', nameEn: 'Triumph', nameAr: 'تريومف' },
          { id: 'masaken-sheraton', nameEn: 'Masaken Sheraton', nameAr: 'مساكن شيراتون' },
        ],
      },
      {
        id: 'maadi',
        nameEn: 'Maadi',
        nameAr: 'المعادي',
        areas: [
          { id: 'old-maadi', nameEn: 'Old Maadi', nameAr: 'المعادي القديمة' },
          { id: 'new-maadi', nameEn: 'New Maadi', nameAr: 'المعادي الجديدة' },
          { id: 'maadi-degla', nameEn: 'Degla', nameAr: 'دجلة' },
          { id: 'zahraa-maadi', nameEn: 'Zahraa El Maadi', nameAr: 'زهراء المعادي' },
          { id: 'sarayat-el-maadi', nameEn: 'Sarayat El Maadi', nameAr: 'سرايات المعادي' },
          { id: 'autostrad', nameEn: 'Autostrad', nameAr: 'الأوتوستراد' },
          { id: 'corniche-maadi', nameEn: 'Corniche El Maadi', nameAr: 'كورنيش المعادي' },
        ],
      },
      {
        id: 'mokattam',
        nameEn: 'Mokattam',
        nameAr: 'المقطم',
        areas: [
          { id: 'middle-plateau', nameEn: 'Middle Plateau', nameAr: 'الهضبة الوسطى' },
          { id: 'upper-plateau', nameEn: 'Upper Plateau', nameAr: 'الهضبة العليا' },
          { id: 'lower-mokattam', nameEn: 'Lower Mokattam', nameAr: 'المقطم السفلي' },
          { id: 'mokattam-club', nameEn: 'Mokattam Club Area', nameAr: 'منطقة نادي المقطم' },
          { id: 'uptown-cairo', nameEn: 'Uptown Cairo', nameAr: 'أب تاون كايرو' },
        ],
      },
      {
        id: 'shobra',
        nameEn: 'Shobra',
        nameAr: 'شبرا',
        areas: [
          { id: 'rod-el-farag', nameEn: 'Rod El Farag', nameAr: 'روض الفرج' },
          { id: 'sahel', nameEn: 'El Sahel', nameAr: 'الساحل' },
          { id: 'shobra-masr', nameEn: 'Shobra Masr', nameAr: 'شبرا مصر' },
          { id: 'rawd-el-farag-corniche', nameEn: 'Corniche Rod El Farag', nameAr: 'كورنيش روض الفرج' },
        ],
      },
      {
        id: 'ain-shams',
        nameEn: 'Ain Shams',
        nameAr: 'عين شمس',
        areas: [
          { id: 'ain-shams-east', nameEn: 'Ain Shams East', nameAr: 'عين شمس الشرقية' },
          { id: 'ain-shams-west', nameEn: 'Ain Shams West', nameAr: 'عين شمس الغربية' },
          { id: 'matariya', nameEn: 'Matariya', nameAr: 'المطرية' },
          { id: 'helmeya', nameEn: 'Helmeyet El Zaitoun', nameAr: 'حلمية الزيتون' },
        ],
      },
      {
        id: 'marg',
        nameEn: 'El Marg',
        nameAr: 'المرج',
        areas: [
          { id: 'marg-qebly', nameEn: 'Marg Qebly', nameAr: 'المرج القبلي' },
          { id: 'marg-bahary', nameEn: 'Marg Bahary', nameAr: 'المرج البحري' },
          { id: 'ezbet-el-nakhl', nameEn: 'Ezbet El Nakhl', nameAr: 'عزبة النخل' },
          { id: 'khosous-border', nameEn: 'Marg Border Area', nameAr: 'منطقة أطراف المرج' },
        ],
      },
      {
        id: 'salam',
        nameEn: 'El Salam',
        nameAr: 'السلام',
        areas: [
          { id: 'salam-1', nameEn: 'El Salam 1', nameAr: 'السلام أول' },
          { id: 'salam-2', nameEn: 'El Salam 2', nameAr: 'السلام ثان' },
          { id: 'nahda', nameEn: 'El Nahda', nameAr: 'النهضة' },
          { id: 'adly-mansour', nameEn: 'Adly Mansour', nameAr: 'عدلي منصور' },
        ],
      },
      {
        id: 'zaitoun',
        nameEn: 'Zeitoun',
        nameAr: 'الزيتون',
        areas: [
          { id: 'helmeya-zaitoun', nameEn: 'Helmeyet El Zaitoun', nameAr: 'حلمية الزيتون' },
          { id: 'zaitoun-east', nameEn: 'East Zeitoun', nameAr: 'الزيتون الشرقية' },
          { id: 'zaitoun-west', nameEn: 'West Zeitoun', nameAr: 'الزيتون الغربية' },
        ],
      },
      {
        id: 'central-cairo',
        nameEn: 'Central Cairo',
        nameAr: 'وسط القاهرة',
        areas: [
          { id: 'downtown', nameEn: 'Downtown', nameAr: 'وسط البلد' },
          { id: 'garden-city', nameEn: 'Garden City', nameAr: 'جاردن سيتي' },
          { id: 'kasr-el-nil', nameEn: 'Kasr El Nil', nameAr: 'قصر النيل' },
          { id: 'ramses', nameEn: 'Ramses', nameAr: 'رمسيس' },
          { id: 'abbasia', nameEn: 'Abbasia', nameAr: 'العباسية' },
          { id: 'zamalek', nameEn: 'Zamalek', nameAr: 'الزمالك' },
          { id: 'munira', nameEn: 'El Mounira', nameAr: 'المنيرة' },
        ],
      },
      {
        id: 'south-cairo',
        nameEn: 'South Cairo',
        nameAr: 'جنوب القاهرة',
        areas: [
          { id: 'sayeda-zeinab', nameEn: 'Sayeda Zeinab', nameAr: 'السيدة زينب' },
          { id: 'dar-el-salam', nameEn: 'Dar El Salam', nameAr: 'دار السلام' },
          { id: 'basatin', nameEn: 'Basatin', nameAr: 'البساتين' },
          { id: 'torah', nameEn: 'Tora', nameAr: 'طرة' },
          { id: 'helwan', nameEn: 'Helwan', nameAr: 'حلوان' },
          { id: 'maasara', nameEn: 'Maasara', nameAr: 'المعصرة' },
        ],
      },
      {
        id: 'east-expansion-cairo',
        nameEn: 'East Expansion',
        nameAr: 'التوسعات الشرقية',
        areas: [
          { id: 'shorouk-city', nameEn: 'El Shorouk', nameAr: 'الشروق' },
          { id: 'badr-city', nameEn: 'Badr City', nameAr: 'مدينة بدر' },
          { id: 'obour-border', nameEn: 'Near Obour Border', nameAr: 'محيط العبور' },
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
        id: 'dokki',
        nameEn: 'Dokki',
        nameAr: 'الدقي',
        areas: [
          { id: 'dokki-square', nameEn: 'Dokki Square', nameAr: 'ميدان الدقي' },
          { id: 'mosadak', nameEn: 'Mosadak', nameAr: 'مصدق' },
          { id: 'tahrir-street', nameEn: 'Tahrir Street', nameAr: 'شارع التحرير' },
          { id: 'behoos', nameEn: 'El Behoos', nameAr: 'البحوث' },
        ],
      },
      {
        id: 'mohandessin',
        nameEn: 'Mohandessin',
        nameAr: 'المهندسين',
        areas: [
          { id: 'gameat-el-dowal', nameEn: 'Gameat El Dowal', nameAr: 'جامعة الدول' },
          { id: 'syria-street', nameEn: 'Syria Street', nameAr: 'شارع سوريا' },
          { id: 'lebanon-square', nameEn: 'Lebanon Square', nameAr: 'ميدان لبنان' },
          { id: 'ahmed-orabi', nameEn: 'Ahmed Orabi', nameAr: 'أحمد عرابي' },
          { id: 'shehab', nameEn: 'Shehab', nameAr: 'شهاب' },
        ],
      },
      {
        id: 'agouza',
        nameEn: 'Agouza',
        nameAr: 'العجوزة',
        areas: [
          { id: 'agouza-corniche', nameEn: 'Agouza Corniche', nameAr: 'كورنيش العجوزة' },
          { id: 'mohi-el-din', nameEn: 'Mohi El Din Abu El Ezz', nameAr: 'محيي الدين أبو العز' },
          { id: 'kitkat', nameEn: 'Kit Kat', nameAr: 'الكيت كات' },
        ],
      },
      {
        id: 'haram',
        nameEn: 'Haram',
        nameAr: 'الهرم',
        areas: [
          { id: 'haram-main', nameEn: 'Haram Street', nameAr: 'شارع الهرم' },
          { id: 'mashaal', nameEn: 'El Mashaal', nameAr: 'المريوطية/المشعل' },
          { id: 'talbia', nameEn: 'Talbia', nameAr: 'الطالبية' },
          { id: 'omraneya', nameEn: 'Omraneya', nameAr: 'العمرانية' },
        ],
      },
      {
        id: 'faisal',
        nameEn: 'Faisal',
        nameAr: 'فيصل',
        areas: [
          { id: 'faisal-main', nameEn: 'Faisal Street', nameAr: 'شارع فيصل' },
          { id: 'kafr-tuhurmus', nameEn: 'Kafr Tuhurmus', nameAr: 'كفر طهرمس' },
          { id: 'el-remaya', nameEn: 'El Remaya', nameAr: 'الرماية' },
        ],
      },
      {
        id: 'imbaba',
        nameEn: 'Imbaba',
        nameAr: 'إمبابة',
        areas: [
          { id: 'imbaba-center', nameEn: 'Imbaba Center', nameAr: 'وسط إمبابة' },
          { id: 'warraq-border', nameEn: 'Warraq Border', nameAr: 'محيط الوراق' },
          { id: 'munib-imbaba', nameEn: 'North Imbaba', nameAr: 'شمال إمبابة' },
        ],
      },
      {
        id: 'boulaq-el-dakrour',
        nameEn: 'Boulaq El Dakrour',
        nameAr: 'بولاق الدكرور',
        areas: [
          { id: 'boulaq-center', nameEn: 'Boulaq Center', nameAr: 'وسط بولاق' },
          { id: 'king-faisal-border', nameEn: 'Boulaq-Faisal Border', nameAr: 'محيط فيصل/بولاق' },
        ],
      },
      {
        id: 'hadayek-al-ahram',
        nameEn: 'Hadayek Al Ahram',
        nameAr: 'حدائق الأهرام',
        areas: [
          { id: 'gate-1', nameEn: 'Gate 1', nameAr: 'بوابة 1' },
          { id: 'gate-2', nameEn: 'Gate 2', nameAr: 'بوابة 2' },
          { id: 'gate-3', nameEn: 'Gate 3', nameAr: 'بوابة 3' },
          { id: 'gate-4', nameEn: 'Gate 4', nameAr: 'بوابة 4' },
        ],
      },
      {
        id: '6th-of-october',
        nameEn: '6th of October',
        nameAr: '6 أكتوبر',
        areas: [
          { id: 'first-district', nameEn: 'First District', nameAr: 'الحي الأول' },
          { id: 'sixth-district', nameEn: 'Sixth District', nameAr: 'الحي السادس' },
          { id: 'seventh-district-oct', nameEn: 'Seventh District', nameAr: 'الحي السابع' },
          { id: 'hosary', nameEn: 'Hosary', nameAr: 'الحصري' },
          { id: 'motamayez', nameEn: 'El Motamayez', nameAr: 'الحي المتميز' },
          { id: 'october-gardens', nameEn: 'October Gardens', nameAr: 'حدائق أكتوبر' },
          { id: 'dreamland', nameEn: 'Dreamland', nameAr: 'دريم لاند' },
          { id: 'ashgar-city', nameEn: 'Ashgar City', nameAr: 'أشجار سيتي' },
        ],
      },
      {
        id: 'sheikh-zayed',
        nameEn: 'Sheikh Zayed',
        nameAr: 'الشيخ زايد',
        areas: [
          { id: 'district-1-zayed', nameEn: 'District 1', nameAr: 'الحي الأول' },
          { id: 'district-2-zayed', nameEn: 'District 2', nameAr: 'الحي الثاني' },
          { id: 'district-11-zayed', nameEn: 'District 11', nameAr: 'الحي الحادي عشر' },
          { id: 'beverly-hills', nameEn: 'Beverly Hills', nameAr: 'بيفرلي هيلز' },
          { id: 'zayed-2000', nameEn: 'Zayed 2000', nameAr: 'زايد 2000' },
          { id: 'revolution-axis', nameEn: 'Axis Area', nameAr: 'منطقة المحور' },
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
        id: 'east-alexandria',
        nameEn: 'East Alexandria',
        nameAr: 'شرق الإسكندرية',
        areas: [
          { id: 'smouha', nameEn: 'Smouha', nameAr: 'سموحة' },
          { id: 'sidi-gaber', nameEn: 'Sidi Gaber', nameAr: 'سيدي جابر' },
          { id: 'sporting', nameEn: 'Sporting', nameAr: 'سبورتنج' },
          { id: 'stanley', nameEn: 'Stanley', nameAr: 'ستانلي' },
          { id: 'gleem', nameEn: 'Gleem', nameAr: 'جليم' },
          { id: 'laurent', nameEn: 'Laurent', nameAr: 'لوران' },
          { id: 'san-stefano', nameEn: 'San Stefano', nameAr: 'سان ستيفانو' },
          { id: 'miami', nameEn: 'Miami', nameAr: 'ميامي' },
          { id: 'asafra', nameEn: 'Asafra', nameAr: 'العصافرة' },
          { id: 'montaza', nameEn: 'Montaza', nameAr: 'المنتزه' },
          { id: 'mandara', nameEn: 'Mandara', nameAr: 'المندرة' },
        ],
      },
      {
        id: 'central-alexandria',
        nameEn: 'Central Alexandria',
        nameAr: 'وسط الإسكندرية',
        areas: [
          { id: 'raml-station', nameEn: 'Raml Station', nameAr: 'محطة الرمل' },
          { id: 'mansheya', nameEn: 'Mansheya', nameAr: 'المنشية' },
          { id: 'ibrahimia', nameEn: 'Ibrahimia', nameAr: 'الإبراهيمية' },
          { id: 'shatby', nameEn: 'Shatby', nameAr: 'الشاطبي' },
          { id: 'kamal-el-deen', nameEn: 'Kafr Abdo Border', nameAr: 'محيط كفر عبده' },
        ],
      },
      {
        id: 'west-alexandria',
        nameEn: 'West Alexandria',
        nameAr: 'غرب الإسكندرية',
        areas: [
          { id: 'agamy', nameEn: 'Agamy', nameAr: 'العجمي' },
          { id: 'dekheila', nameEn: 'Dekheila', nameAr: 'الدخيلة' },
          { id: 'max', nameEn: 'El Max', nameAr: 'المكس' },
        ],
      },
    ],
  },
  {
    id: 'qalyubia',
    nameEn: 'Qalyubia',
    nameAr: 'القليوبية',
    cities: [
      {
        id: 'shubra-el-kheima',
        nameEn: 'Shubra El Kheima',
        nameAr: 'شبرا الخيمة',
        areas: [
          { id: 'east-shubra-kheima', nameEn: 'East Shubra El Kheima', nameAr: 'شبرا الخيمة شرق' },
          { id: 'west-shubra-kheima', nameEn: 'West Shubra El Kheima', nameAr: 'شبرا الخيمة غرب' },
          { id: 'bahteem', nameEn: 'Bahteem', nameAr: 'بهتيم' },
        ],
      },
      {
        id: 'banha',
        nameEn: 'Banha',
        nameAr: 'بنها',
        areas: [
          { id: 'banha-center', nameEn: 'Banha Center', nameAr: 'وسط بنها' },
          { id: 'atreeb', nameEn: 'Atreeb', nameAr: 'أتريب' },
        ],
      },
      {
        id: 'obour',
        nameEn: 'Obour',
        nameAr: 'العبور',
        areas: [
          { id: 'district-1-obour', nameEn: 'District 1', nameAr: 'الحي الأول' },
          { id: 'district-2-obour', nameEn: 'District 2', nameAr: 'الحي الثاني' },
          { id: 'district-3-obour', nameEn: 'District 3', nameAr: 'الحي الثالث' },
          { id: 'golf-city-obour', nameEn: 'Golf City', nameAr: 'جولف سيتي' },
        ],
      },
      {
        id: 'qalyub',
        nameEn: 'Qalyub',
        nameAr: 'قليوب',
        areas: [
          { id: 'qalyub-center', nameEn: 'Qalyub Center', nameAr: 'وسط قليوب' },
          { id: 'mit-halfa', nameEn: 'Mit Halfa', nameAr: 'ميت حلفا' },
        ],
      },
      {
        id: 'khanka',
        nameEn: 'Khanka',
        nameAr: 'الخانكة',
        areas: [
          { id: 'khanka-center', nameEn: 'Khanka Center', nameAr: 'وسط الخانكة' },
          { id: 'abu-zaabal', nameEn: 'Abu Zaabal', nameAr: 'أبو زعبل' },
        ],
      },
    ],
  },
  {
    id: 'sharqia',
    nameEn: 'Sharqia',
    nameAr: 'الشرقية',
    cities: [
      {
        id: 'zagazig',
        nameEn: 'Zagazig',
        nameAr: 'الزقازيق',
        areas: [
          { id: 'zagazig-center', nameEn: 'Zagazig Center', nameAr: 'وسط الزقازيق' },
          { id: 'qawmia', nameEn: 'Qawmia', nameAr: 'القومية' },
        ],
      },
      {
        id: '10th-of-ramadan',
        nameEn: '10th of Ramadan',
        nameAr: 'العاشر من رمضان',
        areas: [
          { id: 'district-1-ramadan', nameEn: 'District 1', nameAr: 'الحي الأول' },
          { id: 'district-2-ramadan', nameEn: 'District 2', nameAr: 'الحي الثاني' },
          { id: 'district-3-ramadan', nameEn: 'District 3', nameAr: 'الحي الثالث' },
        ],
      },
      {
        id: 'belbeis',
        nameEn: 'Belbeis',
        nameAr: 'بلبيس',
        areas: [
          { id: 'belbeis-center', nameEn: 'Belbeis Center', nameAr: 'وسط بلبيس' },
        ],
      },
    ],
  },
  {
    id: 'dakahlia',
    nameEn: 'Dakahlia',
    nameAr: 'الدقهلية',
    cities: [
      {
        id: 'mansoura',
        nameEn: 'Mansoura',
        nameAr: 'المنصورة',
        areas: [
          { id: 'toriel', nameEn: 'Toriel', nameAr: 'توريل' },
          { id: 'gomhoria', nameEn: 'Gomhoria Street', nameAr: 'شارع الجمهورية' },
          { id: 'university-district', nameEn: 'University District', nameAr: 'حي الجامعة' },
        ],
      },
      {
        id: 'mit-ghamr',
        nameEn: 'Mit Ghamr',
        nameAr: 'ميت غمر',
        areas: [
          { id: 'mit-ghamr-center', nameEn: 'Mit Ghamr Center', nameAr: 'وسط ميت غمر' },
        ],
      },
    ],
  },
  {
    id: 'gharbia',
    nameEn: 'Gharbia',
    nameAr: 'الغربية',
    cities: [
      {
        id: 'tanta',
        nameEn: 'Tanta',
        nameAr: 'طنطا',
        areas: [
          { id: 'tanta-center', nameEn: 'Tanta Center', nameAr: 'وسط طنطا' },
          { id: 'saeed-street', nameEn: 'Saeed Street', nameAr: 'شارع سعيد' },
        ],
      },
      {
        id: 'mahala',
        nameEn: 'El Mahalla El Kubra',
        nameAr: 'المحلة الكبرى',
        areas: [
          { id: 'mahala-center', nameEn: 'Mahalla Center', nameAr: 'وسط المحلة' },
        ],
      },
    ],
  },
  {
    id: 'monufia',
    nameEn: 'Monufia',
    nameAr: 'المنوفية',
    cities: [
      {
        id: 'shebin-el-kom',
        nameEn: 'Shebin El Kom',
        nameAr: 'شبين الكوم',
        areas: [
          { id: 'shebin-center', nameEn: 'Shebin Center', nameAr: 'وسط شبين الكوم' },
        ],
      },
      {
        id: 'menouf',
        nameEn: 'Menouf',
        nameAr: 'منوف',
        areas: [
          { id: 'menouf-center', nameEn: 'Menouf Center', nameAr: 'وسط منوف' },
        ],
      },
    ],
  },
  {
    id: 'beheira',
    nameEn: 'Beheira',
    nameAr: 'البحيرة',
    cities: [
      {
        id: 'damanhour',
        nameEn: 'Damanhour',
        nameAr: 'دمنهور',
        areas: [
          { id: 'damanhour-center', nameEn: 'Damanhour Center', nameAr: 'وسط دمنهور' },
        ],
      },
      {
        id: 'kafr-el-dawar',
        nameEn: 'Kafr El Dawar',
        nameAr: "",
        areas: []
      }
    ],
  },
];