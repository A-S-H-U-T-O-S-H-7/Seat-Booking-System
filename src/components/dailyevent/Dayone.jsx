import React, { useState } from 'react';

const scheduleData = {
  odia: {
    title: "କାର୍ଯ୍ୟସୂଚୀ",
    openingCeremony: {
      title: "ଉଦ୍‌ଘାଟନୀ ଉତ୍ସବ",
      date: "ତାରିଖ ୦୩•୧୨.୨୦୨୫ ବୁଧବାର ସନ୍ଧ୍ୟା ୫ ଘଟିକା ରୁ 6 ଘଟିକା",
      inaugurator: "ଉଦ୍‌ଘାଟକ",
      inauguratorName: "ଆଦି ଶଙ୍କରାଚାର୍ଯ୍ୟ ସ୍ୱାମୀ ନିଶ୍ଚଳାନନ୍ଦ ସରସ୍ବତୀ, ଗୋବର୍ଧନ ମଠ, ପୁରୀ",
      mainSpeaker: "ମୁଖ୍ୟବକ୍ତା",
      mainSpeakerName: "ପୂଜ୍ୟ ବାବା ସଚ୍ଚିଦାନନ୍ଦ ଦାସ ମହାରାଜ (ଅଧ୍ଯକ୍ଷ, ଝାଞ୍ଜପିଟା ମଠ, ପୁରୀ)",
      honoredGuest: "ସମ୍ମାନୀତ ଅତିଥୁ",
      honoredGuestName: "ପୂଜ୍ୟ ମହନ୍ତ ରାମକୃଷ୍ଣ ଦାସ ମହାରାଜ (ଅଧକ୍ଷ, ଶ୍ରୀଜଗନ୍ନାଥ ପାଞ୍ଚରାତ୍ର ପ୍ରଚାର ସମିତି, ଭୁବନେଶ୍ଵର)",
      seriesSpeaker: "ଧାରାବାହିକ ପ୍ରବକ୍ତା",
      seriesSpeakerName: "ପୂଜ୍ୟ ବାବା ସତ୍ୟାନନ୍ଦ ଦାସ ମହାରାଜ (ଅଧ୍ଯକ୍ଷ, ଶ୍ରୀଗୁରୁକୃପା କୁଟୀର, ତିହୁଡ଼ା, ନାଉଗାଁ, ଜଗତସିଂହପୁର)"
    },
    dailyProgram: {
      title: "ଦୈନିକ କାର୍ଯ୍ୟକ୍ରମ",
      dates: "ତାରିଖ ୦୩.୧୨.୨୦୨୫ ବୁଧବାର ଠାରୁ ତାରିଖ ୦୭.୧୨.୨୦୨୫ ରବିବାର ପର୍ଯ୍ୟନ୍ତ",
      morning: "ପ୍ରାତଃ",
      afternoon: "ଅପରାହ୍ନ",
      evening: "ସନ୍ଧ୍ୟା",
      night: "ରାତ୍ର",
      schedule: [
        { time: "୫.୦୦ରୁ ୬,୦୦", activity: "ମଙ୍ଗଳ ଆରତୀ, ଦେବାଦେବୀ ପୂଜାର୍ଜନା", icon: "🌅" },
        { time: "୬.୦୦ରୁ ୭.୦୦", activity: "ଶ୍ରୀଜଗନ୍ନାଥ ନାମ ସଂକୀର୍ତ୍ତନ", icon: "🎵" },
        { time: "୭.୦୦ ରୁ ୮.୦୦", activity: "ପ୍ରବଚନ: \"ଶ୍ରୀଜଗନ୍ନାଥ ଭକ୍ତି ସରିତା\"", speaker: "ପ୍ରବକ୍ତା – ବାବା ସତ୍ୟାନନ୍ଦ ଦାସ ମହାରାଜ", icon: "📖" },
        { time: "୮.୦୦ ରୁ ୯.୦୦", activity: "ସୂର୍ଯ୍ୟପୂଜା, ଶାଳାପୂଜା ଓ ଯଜ୍ଞମଣ୍ଡପ ଅଧୂଷ୍ଠିତ ଦେବାଦେବୀଙ୍କ ପୂଜାର୍ଚ୍ଚନା", icon: "🛕" },
        { time: "୯.୦୦ ରୁ ୧୨.୦୦", activity: "ମହର୍ଷି ବେଦବ୍ୟାସକୃତ ସ୍କନ୍ଦପୁରାଣାନ୍ତର୍ଗତ \"ଶ୍ରୀପୁରୁଷୋତ୍ତମକ୍ଷେତ୍ର ମାହାତ୍ମ୍ୟ ପାରାୟଣ\"", icon: "📚" },
        { time: "୨.୦୦ରୁ ୫.୦୦", activity: "ଘୃତ ଯଜ୍ଞ", icon: "🔥" },
        { time: "୫.୦୦ରୁ ୫•୩୦", activity: "ସନ୍ଧ୍ୟା ଆରତୀ ଓ ଶ୍ରୀଜଗନ୍ନାଥ ନାମ ସଂକୀର୍ତ୍ତନ", icon: "🪔" }
      ],
      specialDay: {
        title: "ତାରିଖ ୦୩•୧୨.୨୦୨୫ ବୁଧବାର ସନ୍ଧ୍ୟା ୫ ଘଟିକା ରୁ ୬ ଘଟିକା - ଉଦ୍‌ଘାଟନୀ ଉତ୍ସବ",
        items: [
          { time: "୬•୦୦ରୁ ୭•୦୦", activity: "ମହର୍ଷି ବେଦବ୍ୟାସକୃତ ସ୍କନ୍ଦପୁରାଣାନ୍ତର୍ଗତ \"ଶ୍ରୀପୁରୁଷୋତ୍ତମକ୍ଷେତ୍ର ମାହାତ୍ମ୍ୟ\"", speaker: "ପ୍ରବକ୍ତା - ବାବା ସତ୍ୟାନନ୍ଦ ଦାସ ମହାରାଜ", icon: "📖" }
        ]
      },
      cultural: {
        title: "ସଂସ୍କୃତିକ କର୍ଯ୍ୟକ୍ରମ",
        time: "୭•୦୦ ରୁ ୧୦•୩୦",
        description: "ଓଡିଶୀ, ମହରୀ, ଗୋଟିପୁଅ, ସମ୍ବଲପୁରୀ ଡାନ୍ସ, ଜଗନ୍ନାଥ ଭଜନ ଇତ୍ୟାଦି",
        note: "ପ୍ରତିଦିନ ନୂତନ କଳାକାର, ନୃତ୍ୟଶିଳ୍ପୀ ଏବଂ ପ୍ରବକ୍ତା (କଥାବାଚ) ଉପସ୍ଥିତ ରହିବେ।",
        icon: "🎭"
      },
      rest: { time: "୦୯.୦୦", activity: "ଆରତୀ ପରେ ବିଶ୍ରାମ", icon: "🌙" }
    }
  },
  hindi: {
    title: "कार्यसूची",
    openingCeremony: {
      title: "उद्घाटन उत्सव",
      date: "तारीख: ०३•१२•२०२५ (बुधवार), संध्या ५:०० बजे से ६:०० बजे",
      inaugurator: "उद्घाटक",
      inauguratorName: "आदी शंकराचार्य स्वामी निश्चलानन्द सरस्वती, गोवर्धन मठ, पुरी",
      mainSpeaker: "मुख्य वक्ता",
      mainSpeakerName: "पूज्य बाबा सच्चिदानन्द दास महाराज (अध्यक्ष, झांझपिटा मठ, पुरी)",
      honoredGuest: "सम्मानित अतिथि",
      honoredGuestName: "पूज्य महंत रामकृष्ण दास महाराज (अध्यक्ष, श्रीजगन्नाथ पाञ्चरात्र प्रचार समिति, भुवनेश्वर)",
      seriesSpeaker: "धारावाहिक प्रवक्ता",
      seriesSpeakerName: "पूज्य बाबा सत्यानन्द दास महाराज (अध्यक्ष, श्रीगुरुकृपा कुटीर, तिहुड़ा, नवगाँव, जगतसिंहपुर)"
    },
    dailyProgram: {
      title: "दैनिक कार्यक्रम",
      dates: "तारीख: ०३.१२.२०२५ (बुधवार) से ०७.१२.२०२५ (रविवार) तक",
      morning: "प्रातः",
      afternoon: "अपराह्न",
      evening: "संध्या",
      night: "रात्रि",
      schedule: [
        { time: "५:०० से ६:००", activity: "मंगल आरती, देव-देवी पूजार्चना", icon: "🌅" },
        { time: "६:०० से ७:००", activity: "श्रीजगन्नाथ नाम संकीर्तन", icon: "🎵" },
        { time: "७:०० से ८:००", activity: "प्रवचन: \"श्रीजगन्नाथ भक्ति सरिता\"", speaker: "प्रवक्‍ता: बाबा सत्यानन्द दास महाराज", icon: "📖" },
        { time: "८:०० से ९:००", activity: "सूर्यपूजा, शालापूजा एवं यज्ञमण्डपाधिष्ठित देव-देवी की पूजार्चना", icon: "🛕" },
        { time: "९:०० से १२:००", activity: "महर्षि वेदव्यासकृत स्कन्दपुराणान्तरगत \"श्रीपुरुषोत्तमक्षेत्र महात्म्य पारायण\"", icon: "📚" },
        { time: "२:०० से ५:००", activity: "घृत यज्ञ", icon: "🔥" },
        { time: "५:०० से ५:३०", activity: "संध्या आरती एवं श्रीजगन्नाथ नाम संकीर्तन", icon: "🪔" }
      ],
      specialDay: {
        title: "तारीख ०३•१२•२०२५ (बुधवार) संध्या ५:०० से ६:०० — उद्घाटन उत्सव",
        items: [
          { time: "६:०० से ७:००", activity: "महर्षि वेदव्यासकृत स्कन्दपुराणान्तरगत \"श्रीपुरुषोत्तमक्षेत्र महात्म्य\"", speaker: "प्रवक्ता: बाबा सत्यानन्द दास महाराज", icon: "📖" }
        ]
      },
      cultural: {
        title: "सांस्कृतिक कार्यक्रम",
        time: "७:०० से १०:३०",
        description: "ओडिशी, महरी, गोतिपुआ, संबलपुरी नृत्य, जगन्नाथ भजन इत्यादि",
        note: "प्रतिदिन नए कलाकार, नृत्यांगना और प्रवक्ता (कथावाचन) उपस्थित रहेंगे।",
        icon: "🎭"
      },
      rest: { time: "९:००", activity: "आरती के बाद विश्राम", icon: "🌙" }
    }
  },
  english: {
    title: "Program Schedule",
    openingCeremony: {
      title: "Opening Ceremony",
      date: "Date: 03.12.2025 (Wednesday), Evening 5:00 PM to 6:00 PM",
      inaugurator: "Chief Inaugurator",
      inauguratorName: "Adi Shankaracharya Swami Nischalananda Saraswati, Govardhan Math, Puri",
      mainSpeaker: "Main Speaker",
      mainSpeakerName: "Pujya Baba Sachchidananda Das Maharaj (Chairman, Jhajhapita Math, Puri)",
      honoredGuest: "Honored Guest",
      honoredGuestName: "Pujya Mahant Ramakrishna Das Maharaj (Chairman, Shri Jagannath Pancharatra Prachar Samiti, Bhubaneswar)",
      seriesSpeaker: "Series Speaker",
      seriesSpeakerName: "Pujya Baba Satyananda Das Maharaj (Chairman, Shri Gurukripa Kutir, Tihuda, Naugaon, Jagatsinghpur)"
    },
    dailyProgram: {
      title: "Daily Program",
      dates: "From 03.12.2025 (Wednesday) to 07.12.2025 (Sunday)",
      morning: "Morning",
      afternoon: "Afternoon",
      evening: "Evening",
      night: "Night",
      schedule: [
        { time: "5:00 AM to 6:00 AM", activity: "Mangala Arati; worship of the deities", icon: "🌅" },
        { time: "6:00 AM to 7:00 AM", activity: "Shri Jagannath name sankirtan (devotional chanting)", icon: "🎵" },
        { time: "7:00 AM to 8:00 AM", activity: "Discourse: \"Shri Jagannath Bhakti Sarita\"", speaker: "Speaker: Baba Satyananda Das Maharaj", icon: "📖" },
        { time: "8:00 AM to 9:00 AM", activity: "Surya Puja, Shala Puja and worship of the deities installed in the yajnashala", icon: "🛕" },
        { time: "9:00 AM to 12:00 PM", activity: "Recitation/parayana of Maharshi Vedavyasa's Skanda Purana section \"Shripurushottama Kshetra Mahatmya\"", icon: "📚" },
        { time: "2:00 PM to 5:00 PM", activity: "Ghrita Yajna (ghee sacrifice)", icon: "🔥" },
        { time: "5:00 PM to 5:30 PM", activity: "Evening Arati and Shri Jagannath name sankirtan", icon: "🪔" }
      ],
      specialDay: {
        title: "Special (03.12.2025 — Opening Day): 05:00 PM to 06:00 PM — Opening ceremony",
        items: [
          { time: "06:00 PM to 07:00 PM", activity: "Maharshi Vedavyasa's Skanda Purana section \"Shripurushottama Kshetra Mahatmya\"", speaker: "Speaker: Baba Satyananda Das Maharaj", icon: "📖" }
        ]
      },
      cultural: {
        title: "Cultural Program (Evening)",
        time: "7:00 PM to 10:30 PM",
        description: "Cultural performances — Odissi, Mahari, Gotipua, Sambalpuri dance, Jagannath bhajans, etc.",
        note: "Each day will feature new performers, artists, and speakers (Kathabach).",
        icon: "🎭"
      },
      rest: { time: "9:00 PM", activity: "After Arati — rest", icon: "🌙" }
    }
  }
};

export default function JagannathSchedule() {
  const [language, setLanguage] = useState('english');

  const languages = [
    { id: 'odia', label: 'ଓଡିଆ' },
    { id: 'hindi', label: 'हिन्दी' },
    { id: 'english', label: 'English' }
  ];

  const content = scheduleData[language];
  const opening = content.openingCeremony;
  const daily = content.dailyProgram;

  return (
    <div className="min-h-screen bg-gradient-to-br pt-4 from-orange-50 via-yellow-50 to-red-50">
      {/* Language Selector */}
      <div className="max-w-7xl mx-auto px-2 md:px-6 mb-4">
        <div className="flex justify-end">
          <div className="bg-white/90 backdrop-blur-sm rounded-xl p-1.5 shadow-lg border border-orange-200">
            <div className="flex gap-1">
              {languages.map((lang) => (
                <button
                  key={lang.id}
                  onClick={() => setLanguage(lang.id)}
                  className={`px-3 md:px-4 py-1.5 rounded-lg font-medium text-sm transition-all duration-300 ${
                    language === lang.id
                      ? 'bg-gradient-to-r from-pink-500 to-fuchsia-500 text-white shadow-md'
                      : 'text-gray-600 hover:text-pink-600 hover:bg-fuchsia-50'
                  }`}
                >
                  {lang.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-2 md:px-6 py-6 md:py-12">
        <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-orange-200 overflow-hidden">
          <div className="p-2 md:p-12">
            
            {/* Page Title */}
            <div className="text-center mb-10">
              <div className="flex items-center justify-center mb-6">
                <div className="h-1 w-16 bg-gradient-to-r from-orange-400 to-red-400 rounded-full"></div>
                <span className="mx-4 text-orange-600 text-4xl">🌸</span>
                <div className="h-1 w-16 bg-gradient-to-r from-red-400 to-orange-400 rounded-full"></div>
              </div>
              
              <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-8">
                {content.title}
              </h2>
            </div>

            {/* Opening Ceremony Section */}
            <div className="mb-12 bg-gradient-to-r from-orange-100 to-red-100 rounded-2xl py-4 px-2 md:p-8 border border-orange-200">
              <h3 className="text-2xl md:text-3xl font-bold text-orange-700 mb-4 text-center">
                {opening.title}
              </h3>
              <p className="text-center text-gray-700 font-medium mb-6">
                {opening.date}
              </p>
              
              <div className="space-y-4">
                <div className="bg-white/60 rounded-xl p-4">
                  <p className="font-bold text-orange-600 mb-1">{opening.inaugurator}:</p>
                  <p className="text-gray-700">{opening.inauguratorName}</p>
                </div>
                
                <div className="bg-white/60 rounded-xl p-4">
                  <p className="font-bold text-orange-600 mb-1">{opening.mainSpeaker}:</p>
                  <p className="text-gray-700">{opening.mainSpeakerName}</p>
                </div>
                
                <div className="bg-white/60 rounded-xl p-4">
                  <p className="font-bold text-orange-600 mb-1">{opening.honoredGuest}:</p>
                  <p className="text-gray-700">{opening.honoredGuestName}</p>
                </div>
                
                <div className="bg-white/60 rounded-xl p-4">
                  <p className="font-bold text-orange-600 mb-1">{opening.seriesSpeaker}:</p>
                  <p className="text-gray-700">{opening.seriesSpeakerName}</p>
                </div>
              </div>
            </div>

            {/* Daily Program Section */}
            <div className="mb-10">
              <h3 className="text-2xl md:text-3xl font-bold text-center mb-4 text-gray-800">
                {daily.title}
              </h3>
              <p className="text-center text-gray-600 font-medium mb-8">
                {daily.dates}
              </p>

              <div className="space-y-6">
                {daily.schedule.map((item, index) => (
                  <div key={index} className="bg-gradient-to-r from-orange-50 to-red-50 rounded-2xl p-4 shadow-lg border border-orange-100 hover:shadow-xl transition-all duration-300">
                    <div className="flex flex-col md:flex-row md:items-start md:space-x-6">
                      <div className="flex items-center space-x-4 mb-4 md:mb-0 md:w-72">
                        <div className="text-3xl">{item.icon}</div>
                        <div>
                          <div className="text-sm font-bold text-orange-600 bg-orange-100 px-3 py-1 rounded-full inline-block mb-2">
                            {item.time}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex-1">
                        <h4 className="text-lg font-bold text-gray-800 mb-2">
                          {item.activity}
                        </h4>
                        {item.speaker && (
                          <p className="text-sm text-gray-600 italic">
                            {item.speaker}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Special Day Section */}
            <div className="mb-10 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-4 md:p-6 border border-blue-200">
              <h4 className="text-lg md:text-xl font-bold text-blue-700 mb-4">
                {daily.specialDay.title}
              </h4>
              
              <div className="space-y-4">
                {daily.specialDay.items.map((item, index) => (
                  <div key={index} className="bg-white/60 rounded-xl p-4">
                    <div className="flex items-center space-x-3 mb-2">
                      <span className="text-2xl">{item.icon}</span>
                      <span className="text-sm font-bold text-blue-600 bg-blue-100 px-3 py-1 rounded-full">
                        {item.time}
                      </span>
                    </div>
                    <p className="text-gray-800 font-medium mb-1">{item.activity}</p>
                    <p className="text-sm text-gray-600 italic">{item.speaker}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Cultural Program Section */}
            <div className="mb-10 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 md:p-6 border border-purple-200">
              <div className="flex items-center space-x-3 mb-4">
                <span className="text-3xl">{daily.cultural.icon}</span>
                <h4 className="text-xl md:text-2xl font-bold text-purple-700">
                  {daily.cultural.title}
                </h4>
              </div>
              
              <div className="bg-white/60 rounded-xl p-4 mb-3">
                <p className="text-sm font-bold text-purple-600 mb-2">
                  {daily.cultural.time}
                </p>
                <p className="text-gray-700">
                  {daily.cultural.description}
                </p>
<p className="text-orange-500 mt-4 italic">
       {daily.cultural.note}
   </p>
               </div>
              
              <div className="bg-white/60 rounded-xl p-4 flex items-center space-x-3">
                <span className="text-2xl">{daily.rest.icon}</span>
                <div>
                  <span className="text-sm font-bold text-purple-600 mr-2">
                    {daily.rest.time}
                  </span>
                  <span className="text-gray-700">{daily.rest.activity}</span>
                </div>
              </div>
            </div>

            {/* Devotional Quote */}
            <div className="text-center pt-8 border-t border-orange-200 mt-10">
              <div className="inline-flex items-center space-x-3 text-orange-600 mb-4">
                <span className="text-2xl">🙏</span>
                <span className="font-sanskrit text-lg">
                  जगन्नाथस्वामी नयनपथगामी भवतु मे
                </span>
                <span className="text-2xl">🙏</span>
              </div>
              <p className="text-sm text-gray-500">
                May Lord Jagannātha be the object of my vision
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}