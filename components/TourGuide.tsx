import React, { useEffect } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';

export const TourGuide: React.FC = () => {
  useEffect(() => {
    // Check if tour has been shown before
    const tourCompleted = localStorage.getItem('tourCompleted');
    
    if (!tourCompleted) {
      // Small delay to ensure DOM elements are fully painted
      const timer = setTimeout(() => {
        const driverObj = driver({
          showProgress: true,
          doneBtnText: 'Bitir',
          nextBtnText: 'İleri',
          prevBtnText: 'Geri',
          allowClose: false,
          steps: [
            {
              popover: {
                title: 'Lama Attendance\'a Hoş Geldiniz!',
                description: 'Bu kısa rehberle uygulamanın temel özelliklerini hızlıca keşfedelim.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '#tour-menu-logo',
              popover: {
                title: 'Menü ve Ayarlar',
                description: 'Buraya tıklayarak yan menüyü açabilir; arşive ulaşabilir, temayı veya dili değiştirebilirsiniz.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              element: '#tour-add-btn',
              popover: {
                title: 'Ders Ekleme',
                description: 'Bu butona tıklayarak yeni bir ders ekleyebilir ve devamsızlık limitini belirleyebilirsiniz.',
                side: 'top',
                align: 'end'
              }
            },
            {
              element: '#tour-schedule-btn',
              popover: {
                title: 'Haftalık Program',
                description: 'Tüm derslerinizi haftalık bir takvim görünümünde buradan inceleyebilirsiniz.',
                side: 'top',
                align: 'end'
              }
            },
            {
              ...(document.querySelector('.tour-notes-btn') ? { element: '.tour-notes-btn' } : {}),
              popover: {
                title: 'Ders Not Defteri 📝',
                description: 'Ders kartlarınızın sağ üst köşesindeki kitap ikonuna tıklayarak hafta hafta ders notlarınızı alabilir, ödev ve sınav tüyolarınızı kaydedebilirsiniz.',
                side: 'bottom',
                align: 'start'
              }
            },
            {
              popover: {
                title: 'Harika! Hazırsınız.',
                description: 'Artık derslerinizi eklemeye ve yoklamalarınızı takip etmeye başlayabilirsiniz!',
                side: 'bottom',
                align: 'center'
              }
            }
          ],
          onDestroyStarted: () => {
            if (!driverObj.hasNextStep() || confirm("Rehberi kapatmak istediğinize emin misiniz?")) {
              localStorage.setItem('tourCompleted', 'true');
              driverObj.destroy();
            }
          },
        });

        // Ensure elements actually exist before starting to avoid crashes
        const menuLogo = document.getElementById('tour-menu-logo');
        if (menuLogo) {
          driverObj.drive();
        }
      }, 500);

      return () => clearTimeout(timer);
    }
  }, []);

  return null;
};
