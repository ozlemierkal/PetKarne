# PetKarnem Web Test

Bu sürüm iPhone Safari'de test etmek için hazırlanmış statik PWA prototipidir.

## Çalışanlar
- Kedi / köpek ekleme
- Pet listesi
- Aşı kaydı
- İç / dış parazit kaydı
- İlaç programı kaydı
- Kilo kaydı
- Veteriner / klinik kaydı
- Sağlık geçmişi
- Sonraki tarih
- Yaklaşan / Bugün / Geciken
- Yapıldı / Ertele
- Verilerin tarayıcı localStorage içinde saklanması
- Ana ekrana eklenebilir PWA yapısı
- Offline cache

## iPhone'da açmak için
Bu klasörün internette bir URL üzerinden yayınlanması gerekir.
Ücretsiz seçenekler: GitHub Pages, Netlify, Cloudflare Pages vb.

Yayınlandıktan sonra:
Safari > URL'yi aç > Paylaş > Ana Ekrana Ekle

## Önemli
Bu web test sürümünde iOS native yerel bildirimleri garanti edilmez.
Gerçek bildirim testi native/TestFlight sürümünde yapılacaktır.


## v2
- Pet düzenleme/silme
- Veteriner düzenleme/silme
- ⭐ Ana Veteriner
- Evde seçilince klinik alanı gizlenir
- Aşı, İç Parazit, Dış Parazit ayrı işlemler
- Aşı alanında iç/dış parazit ifadesi engellenir
- Sağlık ve Karnesi başlık yazımı düzeltildi

## v2.1
- Alt menü: Ana Sayfa → Veterinerim → Sağlık → Takvim → Profil
- Takvim sekmesi geçişi daha sağlam hale getirildi
- Takvim ilaçlardan ayrıldı
- Takvime Veteriner Randevusu Ekle akışı eklendi
- Takvim yalnız randevu, aşı, iç parazit ve dış parazit planlarını gösterir
- Ana sayfa bugünkü ilaç programı sayısını gösterir
- Service worker önbelleği v2.1 için yenilendi

## v2.2
- Sağlık sekmesinde seçili hayvana özel Sağlık Özeti
- Ana sayfa Bugünkü Özet için Detayları Gör
- Randevu eklerken hatırlatma tercihi
- Web testinde gerçek iPhone bildirimi olmadığı açıkça belirtilir
- Takvimde 1 gün Ertele kaldırıldı
- Randevu: Detay / Düzenle / Tamamlandı
- Aşı ve parazit: Yapıldı / Tarihi Değiştir

## v2.2.1
- İkinci ve sonraki veteriner/klinik kayıtları artık Veterinerim ekranında görünür
- Ana Veteriner üstte ⭐ ile sabit gösterilir
- Diğer klinikler ayrı listede görünür ve düzenlenebilir

## v2.2.2
- Ana Sayfa'daki tek ortak Bugünkü Özet kaldırıldı
- Her pet kartının altında o pete özel Bugünkü Özet kartı eklendi
- İki pet varsa iki ayrı özet görünür
- Bugünkü Özet Detayları Gör ekranında Kaydet kaldırıldı; yalnız Kapat/X var
- Randevu Detayı gibi salt-okunur detay ekranlarında da Kaydet gösterilmez

## v2.2.3
- Sağ üstteki işlevsiz bildirim zili kaldırıldı
- Hatırlatma ayarlı veteriner randevularında küçük 🔔 gösterilir
- Özet detayında hatırlatma zamanı yazılır
- Hatırlatma yoksa zil gösterilmez

## v2.2.4
- Ana Sayfa kedi + köpek karşılama görseli
- Üst marka amblemi kedi + köpek
- "Önce bir pet ekle" terminolojisi
- Profil & Ayarlar: Hesabım, Petlerim, Bildirim Ayarları, Veriler & Gizlilik, Hakkında
- PetKarnem Basic • Ücretsiz bilgisi

## v2.2.5
- Aşı, İç Parazit ve Dış Parazit kayıtlarına hatırlatma seçimi eklendi
- Varsayılan hatırlatma Profil & Ayarlar'daki tercihten gelir
- İlaç eklerken ilaç saatlerinde hatırlatma aç/kapat seçeneği eklendi
- Hatırlatma ayarlı sağlık kayıtları ve ilaçlarda 🔔 görünür
- Web testinde ayarlar kaydedilir; gerçek telefon bildirimi native/TestFlight aşamasında çalışacaktır

## v2.2.6
- Aşı / İç Parazit / Dış Parazit için Sonraki Tarih girildiğinde hatırlatma varsayılan olarak açık gelir
- Profilde seçilmiş varsayılan süre kullanılır; süre yoksa 1 gün önce seçilir
- Kullanıcı isterse Hatırlatma yok seçerek kapatabilir

## v2.3
- Sağlık giriş butonları Kaydı Gir olarak netleştirildi
- Sağlık Geçmişi kategori sekmelerine ayrıldı
- Takvim aylık görünüm kazandı; işlem olan günlerde işaret var
- Güne dokununca o günün kayıtları açılıyor
- Yaklaşan / Geçmiş ayrımı eklendi
- Pet adı ve kedi/köpek ikonu takvimde belirgin
- Randevu Ekle butonu küçültüldü
- İlk kilo ilk kayıt olarak korunur
- Yeni kilo girilince profil kilosu güncellenir, geçmiş kilolar saklanır

## v2.3.1
- Takvimdeki + Randevu düğmesinin çalışmama hatası düzeltildi
- Veteriner randevusu ekleme formu geri bağlandı
- Pet, tarih, saat, klinik, hatırlatma ve not alanları çalışır
- Cache sürümü yenilendi

## v2.3.2
- Takvimde yaklaşan aşı, iç parazit ve dış parazit kayıtlarına Detay eklendi
- Sağlık kayıtlarında Yapıldı / Tarihi Değiştir çalışır
- Randevularda Detay / Düzenle / Tamamlandı çalışır
- Tarih değiştirme ekranında sağlık hatırlatma süresi de düzenlenebilir
- Cache sürümü yenilendi

## v2.3.3
- Sağlık Özeti "Son kilo" yerine "Güncel Kilo" gösterir
- Güncel kilo en yeni tarihli kilo kaydından otomatik hesaplanır
- Yeni kilo kaydı girildiğinde Sağlık Özeti ve pet profilindeki kilo güncellenir
- Önceki kilo Sağlık Özeti'nde küçük bilgi olarak gösterilir
- Eski tarihli kilo kaydı sonradan girilirse güncel kiloyu yanlışlıkla değiştirmez

## v2.3.4
- Aynı gün girilen birden fazla kilo kaydında sıralama düzeltildi
- Son girilen kilo Güncel Kilo olarak gösterilir
- Bir önceki kayıt Önceki kilo olarak gösterilir
- Yeni kilo kayıtlarına createdAt zaman damgası eklenir
- Eski test verilerinde zaman damgası yoksa eklenme sırası kullanılır

## v2.3.5
- Sağlık giriş sırası: İç Parazit, Dış Parazit, Aşı, İlaç, Kilo
- Sağlık Geçmişi kategori düğmeleri artık satıra sarılır; Kilo ve Veteriner/Muayene ekrandan taşmaz
- Geçmiş kategori sırası da İç Parazit, Dış Parazit, Aşı, İlaç, Kilo olarak düzenlendi

## v2.3.6
- Ana sayfa karşılama metni "Patili dostunun sağlık takibi tek yerde." olarak değiştirildi

## v2.4
- Fonksiyonlara dokunulmadan görsel tasarım yenilendi
- Ana yeşil korunarak pastel kategori renkleri eklendi
- İç Parazit lila, Dış Parazit mavi, Aşı pembe, İlaç sarı, Kilo mint tonlarında
- Pet kartları ve karşılama alanı daha sıcak hale getirildi
- Takvim, Veterinerim ve Profil kartlarına daha yumuşak renk/geçişler eklendi
- Gölge ve boşluklar modernleştirildi

## v2.4.1
- Sağlık Geçmişi kategori sekmelerinde yazı kontrastı düzeltildi
- Seçili kategori koyu yeşil zemin + beyaz yazı
- Seçili olmayan kategoriler beyaz zemin + koyu yazı

## v2.4.2
- Geliştirme/test sürecinde service worker cache devre dışı bırakıldı
- Eski service worker kayıtları otomatik kaldırılır
- Eski cache kayıtları otomatik temizlenir
- GitHub Pages güncellemeleri Safari'de daha kolay görünür

## v2.4.3
- Veteriner randevusu düzenleme ekranına Klinik seçimi eklendi
- Randevu ilk oluşturulurken klinik boş bırakılmış olsa bile sonradan kayıtlı klinik seçilebilir
- Seçilen klinik randevu detayında görünür

## v2.12 Home + Dost Bilgileri
- Ana sayfa onaylanan referans yerleşimine göre tek parça ve temiz şekilde kuruldu.
- Pet kartına dokununca ayrı Dost Bilgileri ekranı açılır.
- Dost Bilgileri: fotoğraf, ad, tür/cinsiyet/yaş, cinsi, doğum tarihi, güncel kilo, kısırlaştırma, mikroçip, notlar.
- Aşı Takvimi / Geçmiş Kayıtlar / Ölçümler bağlantıları Sağlık ekranındaki ilgili filtreleri açar.
- Üst Düzenle pet düzenleme formunu açar; geri oku ana sayfaya döner.
- Modal X kapatma butonu düzeltildi.
- Ana sayfadaki Takvime Git doğrudan Takvim sekmesini açar.

## v2.13 — Dost Bilgileri referans düzeni
- Ana ekran v2.12 olduğu gibi bırakıldı.
- Yalnızca Dost Bilgileri ekranı kullanıcının gönderdiği referans görsele yaklaştırıldı.
- Dost Bilgileri açıldığında üst marka başlığı gizlenir; ekran doğrudan geri oku / Dost Bilgileri / Düzenle ile başlar.
- Fotoğraf, ad, meta bilgi, bilgi kartı ve üç bağlantı kartının ölçü/boşlukları referansa göre düzenlendi.
- Sağlık sekmesi Dost Bilgileri ekranında yeşil aktif görünür.

## v2.14
- Dost Bilgileri ekranındaki kamera kaldırıldı.
- Düzenleme ekranında Dost Bilgileri ile aynı pet portresi kullanılır.
- İlk test sürümünde fotoğraf değiştirme/yükleme özelliği yoktur.

## v2.15
- Dost Bilgileri ekranından Aşı Takvimi satırı kaldırıldı.
- Geçmiş Kayıtlar adı Sağlık Geçmişi olarak değiştirildi.

## v2.16
- iPhone Safari'de Veteriner Randevusu formunun aşağı/yukarı kayma hissi azaltıldı.
- Modal ekranda sabit tutulur; yalnızca form gövdesi kendi içinde kayar.
- Başlık ve alt butonlar sabit kalır.
- Input/select/textarea 16px yapılarak iOS otomatik zoom davranışı azaltıldı.
- Tarih/saat/select alanlarında genişlik taşması engellendi.

## v2.17
- Dost Bilgileri ekranındaki iPhone/Safari aşağı-yukarı oynama azaltıldı.
- Tüm sayfa yerine yalnızca Dost Bilgileri içeriği kendi içinde scroll olur.
- Detail ekranına geçerken üst alanın display değişiminden kaynaklanan yükseklik sıçraması engellendi.
- Alt menü ve safe-area yüksekliği sabitlendi.

## v2.18
- Dost Bilgileri menüsünde Sağlık Geçmişi adı Sağlık Bilgileri olarak değiştirildi.
- Ölçümler satırı Dost Bilgileri menüsünden kaldırıldı.
- Dost Bilgileri kedi/köpek fotoğrafları tam daire ve 1:1 oranında gösterilir.
- Sağlık ekranındaki Sağlık Geçmişi başlığı artık seçili pet adıyla başlar (örn. Misket Sağlık Geçmişi).

## v2.19
- Dost Bilgileri kedi/köpek portreleri kaynak dosyada da kare merkez kırpıma dönüştürüldü.
- Fotoğraf kapsayıcı ve görsel kesin 154x154 daireye sabitlendi; oval/eğri görünüm engellendi.
- Sağlık ekranının üst başlığı seçili pet adına bağlandı: örn. Misket Sağlık Bilgileri.
- Sağlık Geçmişi başlığı seçili pet adına bağlandı: örn. Misket Sağlık Geçmişi.

## v2.20
- Ana ekran, Dost Bilgileri ve Düzenle ekranı aynı pet görsel dosyalarını kullanır.
- Kedi: pet-cat.jpg her yerde aynıdır.
- Köpek: pet-dog.jpg her yerde aynıdır.
- Ayrı pet-detail-cat.jpg kaldırıldı; böylece detay ekranında farklı fotoğraf kullanılması mümkün değildir.

## v2.21
- Kullanıcının gönderdiği yeni Golden Retriever ve gri kedi fotoğrafları kullanıldı.
- Görseller önce gerçek 1:1 kare dosyalara dönüştürüldü.
- Aynı pet-cat.jpg / pet-dog.jpg ana ekran, Dost Bilgileri ve Düzenle ekranında kullanılır.
- Dost Bilgileri ve Düzenle portreleri clip-path ile gerçek daireye zorlandı.

## v2.22 — Sağlık sadeleştirme
- Sağlık ekranı üç net bölüme ayrıldı: Sağlık Bilgileri, Kayıt Ekle, Sağlık Geçmişi.
- Üst ve alt başlıklar seçili pet adıyla başlar.
- Kayıt ekleme sırası: İç Parazit → Dış Parazit → Aşı → İlaç → Kilo.
- Filtre ve geçmiş listesi daha kompakt hale getirildi.
- Diğer ekranlara dokunulmadı.

## v2.23 — Sağlık ekranı gerçek yeniden tasarım
- Sağlık ekranı artık görsel olarak tamamen farklı ve sade.
- Üstte tek kompakt Sağlık Bilgileri kartı: son aşı, iç/dış parazit, aktif ilaç, güncel kilo, ana veteriner.
- Kayıt Ekle alanı 5 büyük kart yerine kompakt hızlı aksiyonlar olarak yeniden kuruldu.
- Sağlık Geçmişi filtreleri ve liste daha sade hale getirildi.
- Fotoğraflara ve diğer ekranlara dokunulmadı.

## v2.24 — Sağlık Referans Tasarımı
- Sağlık sayfası kullanıcının onayladığı yeşil-beyaz referans görsele göre mobil uyarlanarak yeniden tasarlandı.
- Tek sayfa başlığı: Sağlık.
- Pet seçici kartları üstte yatay şerit halinde.
- Seçili pet için tek Sağlık Bilgileri kartı: son aşı, iç/dış parazit, aktif ilaç, güncel kilo, ana veteriner.
- Kayıt Ekle bölümü 5 kompakt ikon butonundan oluşur.
- Sağlık Geçmişi kartı filtreler ve satır liste düzenine yaklaştırıldı.
- Diğer ekranlara dokunulmadı.

## v2.25 — Sağlık kayıt butonları düzeltmesi
- İç Parazit, Dış Parazit, Aşı, İlaç ve Kilo butonları inline onclick yerine doğrudan JavaScript event handler ile bağlandı.
- healthAction global ve pet seçimi açısından daha sağlam hale getirildi.
- Modal Kaydet düğmesi iPhone/Safari için explicit click handler kullanır.
- Sağlık geçmişi filtreleri de aynı şekilde event handler ile bağlandı.
- Beş kayıt akışının ilgili kod dalları yapısal olarak doğrulandı.

## v2.26 — Takvim kapatma butonları
- Takvim Detay ve Düzenle/Değiştir pencerelerindeki X kapatma butonları explicit type=button yapıldı.
- Tüm dialog X butonlarına merkezi close handler eklendi.
- Kapat / Vazgeç / İptal butonları da en yakın dialogu doğrudan kapatır.
- iPhone/Safari'de form submit davranışına bağlı kalmadan dialog kapanır.

## v2.27 — Kilo senkronizasyonu
- Dost Bilgileri Güncel Kilo artık pet profilindeki güncel kilo değerini esas alır.
- Pet profilinde kilo değiştirildiğinde aynı gün için kilo geçmişi kaydı eklenir/güncellenir.
- Sağlık özetindeki Güncel Kilo da profilin güncel kilosunu esas alır.
- Ana Sayfa, Dost Bilgileri ve Sağlık ekranlarında farklı kilo görünmesi engellenir.

## v2.28 — Veterinerim görseli
- Onaylanan veteriner/kedi/köpek illüstrasyonu Veterinerim başlığının altına eklendi.
- Veteriner/klinik giriş alanları mevcut yerinde bırakıldı.
- Randevular Veterinerim sayfasına taşınmadı; mevcut randevu yapısına dokunulmadı.

## v2.29 — Veteriner görseli boyut düzeltmesi
- Veterinerim görseli mobilde 108 × 108 px olarak kesin biçimde sabitlendi.
- Global img kurallarının görseli tam genişliğe büyütmesi engellendi.
- Görsel başlığın altında ortalanmış küçük yuvarlak rozet olarak kalır.

## v2.30 — Veterinerim avatar düzeltmesi
- Eski büyük veteriner hero bileşeni tamamen kaldırıldı.
- Kaynak görsel ayrıca 144×144 küçük dosyaya dönüştürüldü.
- Veterinerim başlığı altına yeni, bağımsız 96×96 yuvarlak avatar bileşeni eklendi.
- Avatar sabit kutu ve overflow:hidden ile korunur; global img kurallarından etkilenmemesi için ayrı sınıf kullanır.

## v2.31 — Veterinerim sade tasarım
- Veteriner illüstrasyonu tamamen kaldırıldı.
- Veterinerim başlığı altına açık yeşil, küçük ve sıcak bir bilgilendirme kartı eklendi.
- Kartta 🩺 ve 🐾 detayları ile kısa açıklama bulunur.
- Veteriner/klinik ekleme alanı ve mevcut işlevler değiştirilmedi.

## v2.33 — Takvim sadeleştirme
- v2.31 ana sürümünden üretildi.
- Takvim = yapılacak/planlanmış işler.
- Takvimde Bugün (yeşil), 1–7 gün Yaklaşıyor (turuncu), gecikenler (kırmızı) mantığı eklendi.
- Takvim içindeki Geçmiş seçeneği kaldırıldı/gizlendi.
- Sağlık Geçmişi aynen korunur ve yapılmış sağlık kayıtlarının arşivi olmaya devam eder.
- Kilo gibi son tarih gerektirmeyen kayıtların amacı Sağlık Geçmişi olarak kalır.

## v2.34 — Takvim yaklaşan + kilo doğrulama
- Takvim Yaklaşan listesi seçili güne bağlı değildir; bugünden itibaren önümüzdeki 7 günü otomatik gösterir.
- 15 Ağustos'ta 17 Ağustos kaydı, 17'sine dokunmadan Yaklaşan listesinde görünür.
- Kilo kaydı 0 veya negatif olamaz.
- Pet ekleme/düzenleme kilo alanında da 0 ve negatif değer engellenir.
- Kullanılmayan veteriner-avatar.png ve veterinerim-hero.png dosyaları paketten çıkarıldı.

## v2.35 — Dost Bilgileri ekran oturma düzeltmesi
- Dost Bilgileri sabit viewport yüksekliğinden çıkarıldı.
- Sayfa normal mobil akışta kayar; tüm ekranın zıplaması azaltıldı.
- Alt menü sabit kalır, içerik menünün altında kalmaz.
- Başlık satırı sticky tutulur.
- Küçük iPhone ekranlarında yatay taşma ve sıkışma azaltıldı.

## v2.36 — Takvim tarih güncelleme düzeltmesi
- Takvim kaydının tarihi değiştirildiğinde Yaklaşan listesi anında yeniden hesaplanır.
- 17 Ağustos kaydı 18 Ağustos'a taşınırsa 18'i seçmeye gerek kalmadan Yaklaşan listesinde görünür.
- Takvim düzenleme formunda tarih alanının minimumu bugündür.
- Geçmiş tarih seçilirse kayıt engellenir ve “Tarih bugünden eski olamaz.” uyarısı gösterilir.
- Güncellenen tarih hem date hem next alanlarında senkron tutulur.

## v2.37 — Takvim tek render mantığı
- Takvimde iki ayrı Yaklaşan render sistemi kaldırıldı.
- renderCalendar artık tek kaynak: gecikenler + bugün + önümüzdeki 7 gün.
- Takvimde bir güne dokunmak yalnız o günü işaretler; Yaklaşan listesini filtrelemez veya silmez.
- Tarih güncellendiğinde saveState -> renderAll -> renderCalendar zinciriyle liste anında yeniden hesaplanır.
- Tarihi Değiştir/Düzenle ekranında geçmiş tarih hem min alanıyla hem kayıt sırasında doğrulamayla engellenir.

## v2.38
- Takvimde tek dinamik başlık: Yaklaşanlar.
- Güne dokununca başlık ör. 18 Eylül Kayıtları olur ve o güne ait kayıtlar gösterilir.
- Aynı güne tekrar dokununca Yaklaşanlar görünümüne dönülür.
- 7 günden uzak seçili günlerde kayıtlar görünür ama Yaklaşıyor etiketi gösterilmez.
- Sağlık takvim detayında Uygulama → Uygulayan → Sonraki tarih sırası düzenlendi.

## v2.39 — Yapıldı akışı düzeltmesi
- Gelecek tarihli sağlık kaydında Yapıldı düğmesi pasiftir.
- 17 Ağustos kaydı 15 Ağustos'ta tamamlanmış olarak işaretlenemez.
- Yapıldı denince sağlık işlemi Takvim'den kalkar ve Sağlık Geçmişi'ne planlanan uygulama tarihiyle taşınır.
- Sonraki tarih varsa tamamlanan kayıttan ayrı yeni bir gelecek takvim kaydı oluşturulur.
- Böylece tamamlanan işlem kaybolmaz ve bugünün tarihiyle yanlış geçmiş kaydı oluşmaz.

## v2.40 — Takvim başlık düzeltmesi
- Takvimde kalan eski “Yaklaşan” ve “Yaklaşan Kayıtlar” başlıkları kaldırıldı.
- Tek dinamik başlık bırakıldı: Yaklaşanlar.
- Bir gün seçildiğinde aynı başlık örn. “18 Eylül Kayıtları” olarak değişmeye devam eder.

## v2.41 — Toplu düzeltme
- Takvim açılışındaki yeşil “Yaklaşan” düğmesi kaldırıldı; yalnızca tek dinamik “Yaklaşanlar” başlığı kaldı.
- Gelecek veteriner randevuları Sağlık Geçmişi'nden çıkarıldı; yalnız Takvim'de görünür.
- Takvim gün noktaları işlem türüne göre değil zamana göre renklendirilir:
  Bugün yeşil, 1–7 gün turuncu, gecikmiş kırmızı, uzak tarihler nötr gri.
- Yeni kedi ve köpek görselleri pet-cat.jpg / pet-dog.jpg olarak uygulamanın tüm ilgili ekranlarında aynı kaynakla kullanılır.

## v2.42
- Köpek varsayılan görseli kullanıcının son gönderdiği Golden yavru fotoğrafı ile değiştirildi.
- Aynı pet-dog.jpg ana ekran, Dost Bilgileri ve Düzenle ekranında kullanılır.
- Takvim sağlık detayında sıra Uygulama → Uygulayan → Sonraki tarih olarak düzenlendi.
- Sağlık kayıt formunda Uygulayan alanı yoksa eklendi; varsa kayıt nesnesine appliedBy olarak kaydedilir.

## v2.43 — Tarih güncelleme + Uygulayan sırası
- Randevu/sağlık kaydı tarihi değiştirildiğinde eski seçili gün temizlenir.
- Tarih güncellemesi sonrası Takvim otomatik olarak Yaklaşanlar görünümüne döner; kayıt yeni tarihiyle görünmeye devam eder.
- Sağlık kayıt detayındaki sıra kesin olarak Uygulama → Uygulayan → Sonraki tarih yapıldı.

## v2.43 — Yeni varsayılan pet görselleri
- v2.44–v2.46 takvim değişiklikleri alınmadı; çalışan v2.43 tabanı korundu.
- Varsayılan kedi görseli son gönderilen oturan yavru kedi ile değiştirildi.
- Varsayılan köpek görseli son gönderilen oturan Golden yavru ile değiştirildi.

## v2.47 — Çalışan sürüm onarımı
- v2.43 tabanındaki JavaScript çalışma hatası onarıldı.
- Yeni kedi ve köpek görselleri korundu.
- Riskli Uygulayan form enjeksiyonu kaldırıldı; mevcut kayıt şeması korunarak detay sırası Uygulama → Uygulayan → Sonraki tarih tutuldu.
- Uygulama açılışında state dizileri güvenli varsayılanlarla tamamlandı.
- JavaScript syntax kontrolü başarıyla geçti.

## v2.48 — Sayfa scroll düzeltmesi
- Sekmeler arasında geçişte önceki sayfanın scroll konumu artık yeni sayfaya taşınmaz.
- Sağlık sayfasında aşağı kayıp Veterinerim'e geçildiğinde Veterinerim en üstten açılır.
- Aynı davranış Ana Sayfa, Sağlık, Takvim, Veterinerim ve Profil geçişlerinde uygulanır.

## v2.49 — iPhone Safari scroll düzeltmesi
- Sekme değişiminde scroll yalnız bir kez değil birkaç layout turunda sıfırlanır.
- Safari'nin yeni görünüm açıldıktan sonra eski scroll konumunu geri yüklemesi engellenir.
- window, html, body, #app, main ve aktif görünümün scroll konumları birlikte sıfırlanır.
- Browser scroll restoration destekleniyorsa manual moda alınır.

## v2.50 — Giriş / onboarding ekranları
- v2.49 çalışan temel sürümü korunarak 3 ekranlı onboarding eklendi.
- Ekran 1: PetKarnem marka alanı, kedi-köpek görseli ve Hoş Geldin metni.
- Ekran 2: Takvim + yaklaşan hatırlatma görseli ve “PetKarnem takip etsin”.
- Ekran 3: Kedi/Köpek seçim kartları ve “+ Petimi Ekle”.
- Atla düğmesi ve 3 noktalı ilerleme göstergesi eklendi.
- Petimi Ekle, mevcut Pet Ekle formunu açar ve seçilen türü önceden seçer.
- Telefonda görünen PWA/App Icon, PetKarnem yazısı yanında kullanılan küçük kedi-köpek logosundan üretildi; alt yeşil şerit kaldırıldı.
- Onboarding sessionStorage kullanır; yeni tarayıcı oturumunda tekrar gösterilir.

## v2.51 — Takvim + Sağlık geçmişi düzeltmeleri
- Bugün için kayıt yoksa takvimde yalnız tarih vurgusu görünür; kayıt noktası görünmez.
- Bugün gerçekten kayıt varsa yeşil kayıt noktası görünür.
- 1–7 gün içindeki kayıtlar turuncu, gecikmiş kayıtlar kırmızı, uzak tarihler nötr nokta kullanır.
- Veteriner randevuları Sağlık Geçmişi'nden çıkarıldı; randevular yalnız Takvim tarafında gösterilir.
- v2.50 onboarding ekranları ve diğer özellikler korunmuştur.

## v2.52 — Veteriner randevusu / Sağlık Geçmişi düzeltmesi
- Veteriner randevularını Sağlık Geçmişi'ne ikinci kez ekleyen `vets` kaynağı kaldırıldı.
- Sağlık Geçmişi yalnız Aşı, İç Parazit, Dış Parazit, İlaç ve Kilo kayıtlarını gösterir.
- “Veteriner/Muayene” filtresi kaldırıldı; randevular yalnız Takvim'de kalır.
- v2.51 onboarding ve takvim görünümü korunmuştur.

## v2.54 — Scroll düzeltmesi
- Uygulama ekranlarında normal dikey scroll geri getirildi.
- html/body/#app/main/.view üzerindeki sabit height ve overflow kilitleri etkisizleştirildi.
- v2.49'dan kalan çok aşamalı scroll reset mantığı sadeleştirildi; kullanıcı scroll'u ile kavga etmesi engellendi.
- Alt menü sabit kalır, içerik altında kaybolmasın diye alt padding korunur.
- Onboarding açıkken scroll kilidi korunur; onboarding kapalıyken uygulama normal kayar.

## v2.58 — Bugün / Yaklaşanlar takvim mantığı
- v2.54 güvenli temel sürümünden üretildi.
- selectedCalendarDate yalnız seçili günü tutar.
- calendarListMode yalnız listenin Yaklaşanlar mı yoksa seçili gün kayıtları mı olduğunu belirler.
- Bugünün tarihine dokunmak her zaman Yaklaşanlar görünümüne döner.
- Başka bir güne dokunmak yalnız o günün kayıtlarını gösterir.
- Takvim sekmesi açıldığında bugün seçili + Yaklaşanlar görünür.
- Scroll, alt menü ve diğer ekranlara dokunulmadı.

### v2.58 final kontrol
- Bugün seçildiğinde Yaklaşanlar görünür.
- Bugün için kayıt varsa diff=0 olarak Yaklaşanlar listesine dahildir ve BUGÜN etiketi alır.
- Gelecek 7 gün içindeki kayıtlar aynı listede görünür.
- Başka bir gün seçilirse yalnız o günün kayıtları gösterilir.

## v2.59 Onboarding Approved
- v2.58 FINAL baz alındı.
- Kullanıcının ayrı ayrı onayladığı 3 onboarding ekranı kullanıldı.
- Sağa/sola kaydırma aktiftir.
- Atla gerçek dokunma alanıdır.
- Son ekranda + Dostunu Ekle gerçek butondur ve mevcut Dost Ekle akışını açar.
- Bir kez tamamlandıktan/atlandıktan sonra tekrar gösterilmez.
