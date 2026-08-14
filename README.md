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
