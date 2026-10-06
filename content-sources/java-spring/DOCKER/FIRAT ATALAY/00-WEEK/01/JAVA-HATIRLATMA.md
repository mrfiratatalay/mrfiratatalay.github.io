## Önce tek bir zihinsel model

Java'da en temel ilişki şu:

```
TYPE
 │
 ├── class
 │
 ├── record
 │
 ├── interface
 │
 └── enum
```

Ama bunların rolleri aynı değil.

En önemli ayrım:

```
CLASS / RECORD
      ↓
nesne oluşturabiliriz
      ↓
OBJECT

INTERFACE
      ↓
davranış sözleşmesi tanımlar
      ↓
class/record bunu implement eder
```

Şimdi sıfırdan kuralım.

---

# 1. Class nedir?

Şunu yazdım:

```
public class Person {

}
```

Burada henüz bir insan nesnesi oluşturmadım.

Sadece Java'ya:

> `Person` diye yeni bir tip tanımlıyorum.

dedim.

`class` bir **şablon / tip tanımıdır**.

Sonra:

```
Person person = new Person();
```

yazarsam artık bir **object** oluştururum.

Şunu ayır:

```
Person
↓
class / type

new Person()
↓
object oluşturma

person
↓
oluşturulan nesneyi gösteren reference değişkeni
```

Bu üçlü Java'nın bel kemiğidir.

---

# 2. Object nedir?

Şu:

```
new Person()
```

çalıştığında bellekte gerçek bir nesne oluşur.

Mesela:

```
public class Person {

    String name;
    int age;
}
```

ve:

```
Person p1 = new Person();

p1.name = "Ayşe";
p1.age = 23;
```

Artık bellekte bir `Person` nesnesi var.

Kavramsal olarak:

```
p1
 │
 │ reference
 ↓
┌────────────────┐
│ Person object  │
│                │
│ name = "Ayşe"  │
│ age  = 23      │
└────────────────┘
```

Burada çok önemli bir Java mülakat konusu var:

```
Person p1
```

nesnenin kendisi değildir.

`p1`, nesneye ulaşmamızı sağlayan bir **reference**'tır.

Bunu unutma.

---

# 3. Reference nedir?

Şöyle düşün:

```
Person p1 = new Person();
```

Sağ taraf:

```
new Person()
```

nesneyi oluşturur.

Sol taraf:

```
Person p1
```

o nesneye referans tutabilecek bir değişken tanımlar.

Sonra:

```
Person p2 = p1;
```

yazarsam **ikinci bir Person nesnesi yaratmış olmam.**

İki reference aynı nesneye bakar:

```
p1 ───────┐
          ↓
       Person
          ↑
p2 ───────┘
```

Dolayısıyla:

```
p2.name = "Fırat";
```

yazarsam:

```
System.out.println(p1.name);
```

da:

```
Fırat
```

çıkar.

Çünkü iki değişken aynı object'i gösteriyor.

Bu konu daha sonra:

```
== 
equals()
null
garbage collection
immutability
```

konularını anlamanın temelidir.

---

# 4. Class'ın içinde ne bulunur?

Şimdi class'ı gerçek hale getirelim:

```
public class Person {

    private String name;
    private int age;

    public Person(String name, int age) {
        this.name = name;
        this.age = age;
    }

    public String getName() {
        return name;
    }

    public void introduce() {
        System.out.println("Ben " + name);
    }
}
```

Burada dört temel kavram var:

```
field
constructor
method
object
```

`name` ve `age`:

```
private String name;
private int age;
```

**field**.

Bir nesnenin durumunu tutarlar.

Şu:

```
public Person(String name, int age)
```

**constructor**.

Nesne oluşturulurken çalışır.

Şu:

```
public String getName()
```

ve:

```
public void introduce()
```

**method**.

Nesnenin davranışlarını temsil eder.

Sonra:

```
Person ayse = new Person("Ayşe", 23);
```

dediğimiz anda constructor çalışır.

---

# 5. Constructor neden var?

Bu Java mülakatında sorulabilecek temel sorulardan biridir.

Constructor'ın temel amacı:

> Nesne oluşturulduğu anda onu geçerli bir başlangıç durumuna getirmek.

Örneğin:

```
public class BankAccount {

    private String owner;
    private double balance;

    public BankAccount(String owner, double balance) {
        this.owner = owner;
        this.balance = balance;
    }
}
```

Artık:

```
BankAccount account =
        new BankAccount("Ayşe", 1000);
```

oluşturduğum anda hesabın sahibi ve bakiyesi belli.

Constructor'ın:

```
return tipi yoktur.
```

Şuna dikkat:

```
public Person(...)
```

Buradaki `Person` dönüş tipi değil.

Constructor'ın adı class ile aynıdır.

---

# 6. `this` nedir?

Bak:

```
public Person(String name) {
    this.name = name;
}
```

İki tane `name` var.

Sağdaki:

```
name
```

constructor'a gelen parametre.

Soldaki:

```
this.name
```

şu anda işlem yaptığımız **nesnenin field'ı**.

Yani:

```
this
```

kabaca:

> Şu an üzerinde çalıştığım nesne.

demektir.

Mesela:

```
Person p = new Person("Ayşe");
```

constructor çalışırken:

```
this
```

o oluşturulmakta olan `Person` nesnesini ifade eder.

---

# 7. Şimdi record'a geçelim

Senin Spring dersinde şu çıktı:

```
record Video(String name) {}
```

Bu yüzden bunu görür görmez afalladın.

Ama artık class bildiğimiz için record'u çok kolay anlayabiliriz.

Şöyle bir class düşün:

```
public final class Video {

    private final String name;

    public Video(String name) {
        this.name = name;
    }

    public String name() {
        return name;
    }
}
```

Üstelik düzgün:

```
equals()
hashCode()
toString()
```

implementasyonlarını da yazmamız gerekiyor.

Java bize diyor ki:

> Eğer temel amacın veri taşımaksa bunun için daha kısa bir yapı vereyim.

Ve:

```
public record Video(String name) {
}
```

yazıyoruz.

Senin mevcut ders materyalinde de record, veriyi bileşenlerle temsil eden özel bir sınıf biçimi olarak tanımlanıyor; `Video(String name)` tanımı constructor, `name()` erişim metodu ve `equals/hashCode/toString` gibi temel davranışları sağlar. Yapıştırılan metin

Dolayısıyla şunu kesin bil:

> **Record, class'tan tamamen farklı bir dünya değildir. Record özel amaçlı bir class türüdür.**

---

# 8. Record'dan object oluşturabilir miyim?

Evet.

```
public record Video(String name) {
}
```

tanımı var.

Şimdi:

```
Video video = new Video("Java öğreniyorum");
```

yazarım.

Burada:

```
Video
↓
type

video
↓
reference

new Video(...)
↓
object
```

Yani record'dan da nesne oluşturuyoruz.

Ders materyalinde de `record Video(...)` ile tip tanımlamak ve `new Video(...)` ile nesne oluşturmak özellikle birbirinden ayrılıyor. Yapıştırılan metin

---

# 9. Normal class mı record mı?

Şöyle bir şey düşün:

```
record UserDto(
    Long id,
    String username,
    String email
) {}
```

Burada amacımız büyük ölçüde:

> Kullanıcı bilgilerini bir yerden başka yere taşımak.

Bu record için çok uygun.

Ama şöyle bir yapı düşün:

```
public class BankAccount {

    private double balance;

    public void deposit(double amount) {
        // kurallar
    }

    public void withdraw(double amount) {
        // kurallar
    }
}
```

Burada nesnenin:

```
state'i
davranışları
business kuralları
zaman içinde değişen durumu
```

var.

Bu tip bir model için normal class daha doğaldır.

Mülakatta güzel cevap:

> Record'lar çoğunlukla veri taşıyan, value-oriented tipleri kısa ve güvenli şekilde tanımlamak için uygundur. Normal class ise daha genel amaçlıdır ve değişebilir durum, inheritance veya daha karmaşık davranışlar gerektiğinde kullanılabilir.

---

# 10. Record immutable mıdır?

Burada mülakat tuzağı vardır.

Şu:

```
record User(String name) {}
```

için record component'ına karşılık gelen field değiştirilemez:

```
user.name = "Fırat";
```

yapamazsın.

Ama:

```
record Team(List<String> members) {}
```

düşün.

Record içindeki reference değiştirilemez ama referansın gösterdiği `List` mutable ise içeriği değişebilir.

Yani:

> Record **shallowly immutable** davranış sağlar; içindeki mutable nesneleri otomatik olarak immutable yapmaz.

Senin ders materyalinde de bu önemli ayrım belirtilmiş. Yapıştırılan metin

Bu mülakatta güzel puan getirir.

---

# 11. Interface nedir?

Şimdi en önemli kavramlardan birine geldik.

```
public interface PaymentService {

    void pay(double amount);
}
```

Bu:

> `PaymentService` özelliğine sahip bir şey `pay()` davranışını sağlamalı.

diyen bir **contract**, yani sözleşme.

Interface tek başına:

> Bu işin nasıl yapılacağını

söylemek zorunda değildir.

Ne yapılabileceğini tanımlar.

Sonra:

```
public class CreditCardPaymentService
        implements PaymentService {

    @Override
    public void pay(double amount) {
        System.out.println("Kartla ödeme: " + amount);
    }
}
```

Başka bir implementasyon:

```
public class BankTransferPaymentService
        implements PaymentService {

    @Override
    public void pay(double amount) {
        System.out.println("Havale: " + amount);
    }
}
```

İkisi de:

```
PaymentService
```

sözleşmesine uyuyor.

---

# 12. Interface neden gerekli?

İşte mülakat seviyesi burada başlıyor.

Şunu yapabilirim:

```
PaymentService service =
        new CreditCardPaymentService();
```

Dikkat:

```
reference tipi
PaymentService

gerçek object tipi
CreditCardPaymentService
```

Bu inanılmaz önemli.

Sonra istersem:

```
PaymentService service =
        new BankTransferPaymentService();
```

yapabilirim.

Kodu kullanan taraf:

```
service.pay(1000);
```

diyor.

Nasıl ödeme yapıldığını bilmesine gerek yok.

Buna doğru ilerlediğimizde:

```
abstraction
polymorphism
loose coupling
dependency inversion
dependency injection
```

konuları ortaya çıkacak.

Ve Spring'in niçin interface'lerle çok sık kullanıldığını anlayacaksın.

---

# 13. Interface'den `new` ile object oluşturabilir miyiz?

Hayır.

Şunu yapamazsın:

```
PaymentService service =
        new PaymentService();
```

Çünkü interface doğrudan instantiate edilmez.

Ama:

```
PaymentService service =
        new CreditCardPaymentService();
```

olabilir.

Çünkü sağ tarafta gerçek bir concrete class var.

Bunun zihinsel modeli:

```
interface
PaymentService
     ▲
     │ implements
     │
CreditCardPaymentService
     │
     │ new
     ▼
   object
```

---

# 14. Record interface implement edebilir mi?

Evet.

Örneğin:

```
public interface Printable {

    void print();
}
```

Record:

```
public record User(
        String name
) implements Printable {

    @Override
    public void print() {
        System.out.println(name);
    }
}
```

Bu geçerlidir.

Dolayısıyla:

```
record = data
interface = contract
```

diye aşırı katı ezber yapma.

Bir record da davranış içerebilir ve interface implement edebilir.

---

# 15. Class ile interface farkı

Bunu mülakatta çok sorarlar.

| Kavram          | Class                                   | Interface                                       |
| --------------- | --------------------------------------- | ----------------------------------------------- |
| Temel amaç      | Nesnenin state + davranışını tanımlamak | Sözleşme / abstraction tanımlamak               |
| `new` ile nesne | Evet, concrete class ise                | Hayır                                           |
| Field/state     | Evet                                    | Instance state taşımaz                          |
| Constructor     | Evet                                    | Hayır                                           |
| Inheritance     | Bir class bir class'ı extend eder       | Class birden fazla interface implement edebilir |
| Kullanım        | Gerçek implementasyon                   | Yeteneği/sözleşmeyi tanımlama                   |

Modern Java interface'leri yalnızca soyut metotlardan ibaret değildir; `default`, `static` ve bazı durumlarda `private` metotlar da içerebilir. Ama **instance state/constructor dünyası class tarafındadır.**

---

# 16. `List` neden interface?

Spring dersinde şu çıktı:

```
List<Video> videos = List.of(...);
```

Buradaki `List` bir interface'tir. Ders notunda da `List`, liste davranışını tanımlayan arayüz; `List.of(...)` ise somut liste nesnesini sağlayan yapı olarak açıklanıyor. Yapıştırılan metin

Bu aslında interface konusunun gerçek örneği.

Şunu yazabiliriz:

```
List<String> names =
        new ArrayList<>();
```

Burada:

```
List<String>
↓
interface type

ArrayList
↓
concrete class

new ArrayList<>()
↓
object
```

Yani:

```
List<String> names =
        new ArrayList<>();
```

Java dünyasının çok önemli desenlerinden biridir:

> **Program to an interface, not an implementation.**

Bu cümlenin neden önemli olduğunu ileride dependency injection ile bağlayacağız.

---

# 17. Şimdi dördünü birbirinden ayıralım

```
public class User {
}
```

→ normal class.

```
User user = new User();
```

→ `User` object.

```
public record UserDto(
        String name
) {}
```

→ özel bir class türü; veri odaklı yapı.

```
public interface UserRepository {

    User findById(Long id);
}
```

→ bir contract.

Sonra:

```
public class DatabaseUserRepository
        implements UserRepository {

    @Override
    public User findById(Long id) {
        // ...
        return null;
    }
}
```

→ contract'ın gerçek implementasyonu.

Bu dört satır aslında seni ileride şuraya götürecek:

```
Controller
    ↓
Service interface
    ↓
Service implementation
    ↓
Repository interface
    ↓
Database
```

Ama o aşamada artık annotation ezberlemiyor olacaksın. **Java'yı okuyacaksın.**

---

# Java mülakatı için kuracağımız Pure Java yolu

Sadece `class`, `record`, `interface` öğrenip bırakmayacağız. Sıramız şöyle olacak:

| Aşama                       | Konular                                                | Mülakattaki hedef                                    |
| --------------------------- | ------------------------------------------------------ | ---------------------------------------------------- |
| **1 — Object Model**        | class, object, reference, field, method                | Java nesne modelini açıklamak                        |
| **2 — Nesne oluşturma**     | constructor, `this`, method overloading                | Bir object'in nasıl kurulduğunu anlamak              |
| **3 — Encapsulation**       | `private/public/protected`, getter/setter              | Encapsulation neden var anlatmak                     |
| **4 — Object semantics**    | `==`, `equals`, `hashCode`, `toString`, `null`         | Çok sık sorulan Java sorularını çözmek               |
| **5 — `static` ve `final`** | class/instance members, constants                      | Instance ile class seviyesini ayırmak                |
| **6 — Inheritance**         | `extends`, overriding, `super`                         | IS-A ilişkisini anlamak                              |
| **7 — Polymorphism**        | reference type vs object type, dynamic dispatch        | Java OOP'nin kalbini anlamak                         |
| **8 — Abstraction**         | abstract class, interface, `implements`                | Interface/class farkını mülakat seviyesinde anlatmak |
| **9 — Modern veri tipleri** | record, enum, sealed classes                           | Modern Java sorularını cevaplamak                    |
| **10 — Generics**           | `<T>`, `List<String>`, bounded types, wildcards        | Collections kodunu gerçekten okumak                  |
| **11 — Collections**        | List, Set, Map, ArrayList, HashSet, HashMap            | En sık mülakat konularından biri                     |
| **12 — Exceptions**         | checked/unchecked, `try/catch`, custom exception       | Hata yönetimini açıklamak                            |
| **13 — Functional Java**    | lambda, functional interfaces, method reference        | Modern Java syntax'ını anlamak                       |
| **14 — Streams**            | map/filter/reduce, Optional                            | Backend kodunda rahat olmak                          |
| **15 — Advanced core**      | immutability, generics detayları, concurrency, threads | Junior+ mülakatlara hazırlanmak                      |

Bence şu anda **Spring'e tamamen ara vermemize gerek yok**, ama önümüzdeki birkaç çalışmada ağırlığı Pure Java'ya vermeliyiz.

Çünkü senin şu anda gerçekten ihtiyacın olan zincir:

```
class
 ↓
object
 ↓
reference
 ↓
field
 ↓
method
 ↓
constructor
 ↓
encapsulation
 ↓
inheritance
 ↓
polymorphism
 ↓
abstract class
 ↓
interface
 ↓
record
 ↓
generics
 ↓
collections
```

Bunlar oturduğunda Spring koduna tekrar baktığında ciddi bir fark göreceksin.

Örneğin artık:

```
List<Video> videos =
        new ArrayList<>();
```

satırı sana gizemli gelmeyecek. Şunu okuyacaksın:

> `videos` adında bir reference değişkenim var. Tipi `List<Video>`. `List` bir interface. `<Video>` generic type parameter. Sağ tarafta `ArrayList` concrete class'ından gerçek bir object yaratılıyor ve reference buna bağlanıyor.

**İşte Java mülakatında ulaşmanı istediğim okuma seviyesi bu.**

Bir sonraki dersimizi direkt **PURE JAVA PART 1 — Class, Object, Reference, Field, Method, Constructor** olarak yapalım. Spring'e hiç girmeden, bol bellek çizimi ve küçük kodlarla bunları tek tek oturtalım; sonunda da sana gerçek Java mülakat soruları sorayım.

----

----

Interface’i bu sefer **hiç Spring’e girmeden**, saf Java üzerinden oturtalım. Asıl karışıklık genelde şu: interface’i “yarım class” gibi düşününce konu dağılıyor. Daha doğru zihinsel model şu:

> **Interface = “Bu tipi kullanan nesne şu davranışları yapabilmeli” diyen bir sözleşme.**

## En basit örnek

Bir ödeme sistemi yazdığımızı düşün.

Şöyle bir interface tanımlıyorum:

```
public interface PaymentService {

    void pay(double amount);
}
```

Bunun anlamı şu:

> “Kim `PaymentService` olmak istiyorsa, `pay(double amount)` isimli bir davranış sunmak zorunda.”

Ama interface burada **ödemenin nasıl yapılacağını söylemiyor**.

Yani bu:

```
void pay(double amount);
```

şunu söylüyor:

> Bir `pay` metodu olacak.

Ama şunu söylemiyor:

> Karttan mı çekeceksin, IBAN'a mı göndereceksin, PayPal mı kullanacaksın?

İşte kritik nokta bu.

---

## Sonra gerçek class geliyor

Kartla ödeme yapan bir class yazalım:

```
public class CreditCardPaymentService implements PaymentService {

    @Override
    public void pay(double amount) {
        System.out.println("Kredi kartından " + amount + " TL çekildi.");
    }
}
```

Burada:

```
implements PaymentService
```

şu anlama geliyor:

> “Ben `PaymentService` sözleşmesine uyacağım.”

Interface ne istemişti?

```
void pay(double amount);
```

O zaman class bunu gerçekten yazmak zorunda:

```
@Override
public void pay(double amount) {
    ...
}
```

Bunu yazmazsan Java sana hata verir.

---

# Neden bunu yaptık?

Çünkü başka ödeme yöntemleri de olabilir.

```
public class BankTransferPaymentService implements PaymentService {

    @Override
    public void pay(double amount) {
        System.out.println("Banka havalesi ile " + amount + " TL ödendi.");
    }
}
```

Şimdi elimizde iki class var:

```
PaymentService
      ↑
      │ implements
      │
 ┌────┴───────────────┐
 │                    │
CreditCard          BankTransfer
PaymentService      PaymentService
```

İkisi tamamen farklı şekilde ödeme yapıyor.

Ama ikisi de aynı şeyi garanti ediyor:

```
pay(...)
```

metoduna sahipler.

---

# Interface'in asıl gücü burada

Şunu yazabiliyorum:

```
PaymentService paymentService =
        new CreditCardPaymentService();
```

Burayı çok dikkatli oku.

Sol taraf:

```
PaymentService
```

**interface**.

Sağ taraf:

```
new CreditCardPaymentService()
```

**gerçek object**.

Yani:

```
paymentService
      │
      │ reference
      ↓
CreditCardPaymentService object
```

Ama reference'ın tipi:

```
PaymentService
```

Bu mümkündür çünkü:

```
CreditCardPaymentService
```

şunu söyledi:

```
implements PaymentService
```

Yani:

> “Ben PaymentService'im.”

---

# Peki neden direkt class yazmıyoruz?

Haklı soru.

Şunu da yapabilirdik:

```
CreditCardPaymentService service =
        new CreditCardPaymentService();
```

Çalışır.

Ama şimdi kodumuz direkt kredi kartı sistemine bağımlı.

Diyelim:

```
public class OrderService {

    private CreditCardPaymentService paymentService;

}
```

Bu class diyor ki:

> “Ben kesinlikle kredi kartıyla çalışacağım.”

Yarın ödeme sistemini değiştirdin.

Artık:

```
BankTransferPaymentService
```

kullanmak istiyorsun.

`OrderService`'i de değiştirmek zorundasın.

Ama interface kullanırsak:

```
public class OrderService {

    private PaymentService paymentService;

}
```

şimdi `OrderService` şunu söylüyor:

> “Nasıl ödeme yaptığınla ilgilenmiyorum. Bana sadece ödeme yapabilen bir şey ver.”

İşte interface'in gerçek faydası burada.

---

# Somut görelim

```
public interface PaymentService {

    void pay(double amount);
}
```

Kart:

```
public class CreditCardPaymentService implements PaymentService {

    @Override
    public void pay(double amount) {
        System.out.println("Kartla ödeme");
    }
}
```

Havale:

```
public class BankTransferPaymentService implements PaymentService {

    @Override
    public void pay(double amount) {
        System.out.println("Havale ile ödeme");
    }
}
```

Şimdi:

```
PaymentService service =
        new CreditCardPaymentService();

service.pay(1000);
```

çıktı:

```
Kartla ödeme
```

Ama sadece şu satırı değiştiriyorum:

```
PaymentService service =
        new BankTransferPaymentService();
```

Aşağıdaki kod **hiç değişmiyor**:

```
service.pay(1000);
```

Bu sefer çıktı:

```
Havale ile ödeme
```

İşte buna doğru ilerledikçe **polymorphism** diyeceğiz.

---

# Çok önemli: Interface object değildir

Şunu yapamazsın:

```
PaymentService service =
        new PaymentService();
```

❌ Olmaz.

Çünkü interface:

> “Nasıl yapılacağını”

tanımlayan gerçek implementation değildir.

Sadece sözleşmedir.

Gerçek nesne:

```
new CreditCardPaymentService()
```

veya:

```
new BankTransferPaymentService()
```

gibi concrete bir class'tan gelir.

---

# Bunu gerçek hayattan düşün

Bir `USB` standardı düşün.

USB şunu tarif eder:

> “Bu bağlantıya uyacaksan şu kurallara sahip ol.”

Ama USB kendi başına:

- klavye değildir,
- mouse değildir,
- flash bellek değildir.

Çeşitli cihazlar USB standardını uygular.

Java'da da:

```
interface USBDevice {
    void connect();
}
```

Sonra:

```
class Keyboard implements USBDevice {

    @Override
    public void connect() {
        System.out.println("Klavye bağlandı");
    }
}
```

ve:

```
class Mouse implements USBDevice {

    @Override
    public void connect() {
        System.out.println("Mouse bağlandı");
    }
}
```

Bilgisayarın şöyle yazılmış olsun:

```
public void connectDevice(USBDevice device) {
    device.connect();
}
```

Bilgisayarın umurunda değil:

> Mouse mu verdin? Klavye mi verdin?

Tek şart:

```
USBDevice sözleşmesine uyuyor mu?
```

Uyuyorsa çalıştırabilir.

Bu interface mantığına çok yakındır.

---

# Class ile interface arasındaki fark

Şunu düşün:

```
class Dog {
    String name;

    void bark() {
        ...
    }
}
```

`Dog` şunu tanımlar:

> Bu nesnenin verisi nedir ve davranışı nedir?

Interface:

```
interface Runnable {
    void run();
}
```

şunu tanımlar:

> Bu davranışa sahip olmak isteyen tip neyi yapabilmeli?

Yani en basit haliyle:

```
class
=
"Bu nesne NEDİR ve NASIL çalışır?"

interface
=
"Bu nesne NE YAPABİLMELİ?"
```

Bu çok faydalı bir zihinsel ayrımdır.

---

# `implements` kelimesini Türkçeleştir

Şunu:

```
class CreditCardPaymentService
        implements PaymentService
```

okurken kafanda:

> `CreditCardPaymentService`, `PaymentService` sözleşmesini **uyguluyor**.

de.

`implements` zaten:

> uygular / hayata geçirir

mantığında.

Interface sözleşmeyi verir:

```
void pay(double amount);
```

Class uygulamayı verir:

```
public void pay(double amount) {
    System.out.println("Kredi kartı...");
}
```

---

# `@Override` neden var?

Interface:

```
interface PaymentService {
    void pay(double amount);
}
```

Class:

```
class CreditCardPaymentService
        implements PaymentService {

    @Override
    public void pay(double amount) {
        ...
    }
}
```

`@Override` burada:

> “Ben üst taraftan gelen bir metodu uyguluyorum.”

bilgisini belirtir.

Java derleyicisi de seni kontrol eder.

Mesela yanlışlıkla:

```
public void pey(double amount)
```

yazarsan `@Override` sayesinde Java sana:

> Böyle override ettiğin bir method yok.

diye hata verir.

---

# Java mülakatında sorarlarsa

“Interface nedir?” sorusuna şu seviyede cevap verebilirsin:

> Java'da interface, bir tipin sağlaması gereken davranışları tanımlayan bir sözleşmedir. Concrete class'lar `implements` kullanarak bu sözleşmeyi uygular. Interface doğrudan instantiate edilemez. Interface tipinde reference kullanmak, kodun belirli bir implementation'a bağımlılığını azaltır ve polymorphism sağlar.

Bu güzel bir junior mülakat cevabıdır.

Ama ezberleme. Şu kodu anlıyorsan cevap zaten kendiliğinden geliyor:

```
PaymentService service =
        new CreditCardPaymentService();
```

Burada:

```
PaymentService
      ↓
SÖZLEŞME / interface

service
      ↓
REFERENCE

CreditCardPaymentService
      ↓
GERÇEK IMPLEMENTATION / class

new CreditCardPaymentService()
      ↓
GERÇEK OBJECT
```

Ve en önemli cümle:

> **Interface gerçek işi yapmaz. Yapılabilecek işin sözleşmesini tanımlar; gerçek işi onu implement eden class yapar.**

Şimdilik interface konusunda sadece bunu sağlamlaştır. `abstract class`, `default method`, `functional interface`, `multiple inheritance` tarafına henüz girersek temel yine dağılır.

---

---

Tamam. Şimdi **Part’ın `record` kısmından sonuna kadar olan bölümünü**, az önce oturttuğumuz `class → object → reference → interface` bilgisine yaslanarak baştan kuracağız. Bu sefer kodu ezberlemeyeceğiz; her satırın **Java açısından ne olduğunu** ve sonra Spring’in bunu nasıl kullandığını ayıracağız.

## 1. Başlangıç noktamız: `record Video(String name) {}`

Kitapta şu satır geliyor:

```
record Video(String name) {}
```

Bunu ilk gördüğünde karmaşık görünmesi normal. Ama artık `class` bildiğin için aslında çok kolay.

Bu satır Java’ya şunu söylüyor:

> “Benim uygulamamda `Video` adında yeni bir **tip** var. Bir videonun `name` adında `String` bilgisi bulunuyor.”

Yani:

```
Video
↓
yeni bir Java tipi

name
↓
Video'nun taşıdığı veri

String
↓
name bilgisinin tipi
```

Burada henüz **Video nesnesi oluşturmadık**.

Sadece:

```
record Video(String name) {}
```

ile **Video diye bir tip tanımladık.** Kaynağımız da record’u, belirli verileri temsil etmeye yönelik özel bir sınıf biçimi olarak tanımlıyor. Yapıştırılan metin

---

# 2. Record neden var? Normal class yazamaz mıydık?

Yazabilirdik.

Kabaca şöyle bir class düşün:

```
class Video {

    private final String name;

    public Video(String name) {
        this.name = name;
    }

    public String name() {
        return name;
    }
}
```

Bu class’ın amacı büyük ölçüde yalnızca:

> “Bir videonun adını taşı.”

Record bunu çok daha kısa yazmamızı sağlıyor:

```
record Video(String name) {}
```

Java bizim için önemli temel parçaları üretiyor.

Örneğin:

```
new Video("Java öğreniyorum");
```

ile nesne oluşturabilirsin.

Ve:

```
video.name();
```

ile ismini okuyabilirsin.

Ayrıca Java record için `equals()`, `hashCode()` ve `toString()` gibi temel metotları da üretir. Yapıştırılan metin

Şimdilik şu kadarını tut:

> **Class genel amaçlıdır. Record özellikle veri temsil etmek için çok kullanışlı, özel bir class biçimidir.**

---

# 3. Tip tanımlamak başka, object oluşturmak başka

İşte en kritik ayrım.

Bu:

```
record Video(String name) {}
```

bir **tip tanımı**.

Ama bu:

```
new Video("Java öğreniyorum")
```

bir **object oluşturma işlemi**.

Aynı `class` konusunda öğrendiğimiz gibi.

Şunu yazalım:

```
Video video = new Video("Java öğreniyorum");
```

Şimdi satırı üç parçaya böl:

```
Video
  ↓
değişkenin tipi

video
  ↓
reference değişkeninin adı

new Video("Java öğreniyorum")
  ↓
gerçek Video object'i oluşturuluyor
```

Kaynakta da bu ayrım özellikle yapılıyor: `record Video(...)` tipi tanımlar; `new Video(...)` ise o tipten bir nesne oluşturur. Yapıştırılan metin

Bunu artık class bilgisinden tanıyabilirsin.

---

# 4. Constructor nerede?

Şuna bak:

```
new Video("Java öğreniyorum");
```

Sen ayrıca constructor yazmadın.

Çünkü record tanımından:

```
record Video(String name) {}
```

Java uygun constructor’ı oluşturuyor.

Kabaca şu mantık:

```
Video(String name)
```

ve sen:

```
new Video("Java öğreniyorum")
```

dediğinde:

```
name = "Java öğreniyorum"
```

bilgisi object’in içine yerleşiyor.

Sonra:

```
Video video = new Video("Java öğreniyorum");

System.out.println(video.name());
```

çıktı:

```
Java öğreniyorum
```

olur.

Dikkat:

```
video.name()
```

kullanıyoruz.

Otomatik olarak:

```
video.getName()
```

üretilmiyor. Kaynağımız da record accessor’ının `name()` olduğunu özellikle belirtiyor. Yapıştırılan metin

---

# 5. Record'daki veri neden kolayca değiştirilemiyor?

Şu record olsun:

```
record Video(String name) {}
```

Sonra:

```
Video video = new Video("Java");
```

Record component’ına karşılık gelen alan `final` olduğu için sonradan:

```
video.name = "Spring";
```

gibi değiştiremezsin.

Yani object oluşturulurken verdiğimiz:

```
"Java"
```

değeri record’un o component’ı açısından sabittir.

Ama önemli mülakat detayı:

```
record Team(List<String> members) {}
```

gibi içinde mutable bir object varsa, record o object’in içeriğini otomatik olarak dondurmaz. Kaynakta bu ayrım da açıkça belirtiliyor. Yapıştırılan metin

Şimdilik `Video(String name)` örneğimiz çok sade çünkü `String` kullanıyoruz.

---

# 6. Tek Video tamam. Şimdi birden fazla Video lazım

Kitap şimdi şunu yapıyor:

```
List<Video> videos = List.of(
    new Video("Need HELP with your SPRING BOOT 4 App?"),
    new Video("Don't do THIS to your own CODE!"),
    new Video("SECRETS to fix BROKEN CODE!")
);
```

İlk bakışta korkutucu görünüyor.

Ama parçalayınca çok basit.

Önce iç taraf:

```
new Video("Video 1")
```

birinci object.

```
new Video("Video 2")
```

ikinci object.

```
new Video("Video 3")
```

üçüncü object.

Yani bellekte üç ayrı `Video` object’i var.

Şimdi bunları tek yerde tutmak istiyoruz.

Bu yüzden:

```
List.of(...)
```

kullanıyoruz.

---

# 7. `List<Video>` ne demek?

Az önce interface öğrendik.

İşte gerçek kullanımı burada.

```
List
```

bir **interface**.

Yani Java’da liste davranışının sözleşmesini tanımlıyor.

Ama:

```
List<Video>
```

dediğimizde:

> “Bu liste `Video` tipindeki elemanları tutacak.”

diyoruz.

Buradaki:

```
<Video>
```

kısmına **generic type argument** diyeceğiz.

Şimdilik şöyle oku:

```
List<Video>
↓
Video listesi
```

Mesela:

```
List<String>
```

→ String listesi.

```
List<Integer>
```

→ Integer listesi.

```
List<Person>
```

→ Person listesi.

Kaynağımız da `List<Video>` ifadesini “eleman tipi Video olan liste” olarak açıklıyor. Ayrıca `List` bir interface ve `<Video>` generic tip bilgisidir. Yapıştırılan metin

Bak, biraz önce interface'i öğrenmemizin faydası hemen çıktı.

---

# 8. `List.of()` nedir?

Şimdi:

```
List.of(...)
```

görüyorsun.

`of`, `List` üzerinden çağrılan bir **static method**.

Şimdilik static'i daha sonra derinleştireceğiz.

Buradaki görevi:

> “Bana verdiğin elemanlardan bir liste oluştur.”

Örneğin:

```
List<String> names =
        List.of("Ayşe", "Fırat", "Mehmet");
```

üç elemanlı bir liste verir.

Bizde:

```
List<Video> videos = List.of(
    new Video("A"),
    new Video("B"),
    new Video("C")
);
```

üç adet `Video` object’ini tutan bir liste oluşuyor.

---

# 9. Ama önemli: `List.of()` listesini değiştiremezsin

Şöyle oluşturduk:

```
List<Video> videos = List.of(
    new Video("A"),
    new Video("B")
);
```

Sonra:

```
videos.add(new Video("C"));
```

yapmaya çalışırsan hata alırsın.

Çünkü `List.of()` bize **unmodifiable** bir liste verir.

Yani:

```
add ❌
remove ❌
```

Kaynağın da bu listeye sonradan `add()` veya `remove()` uygulanmasının `UnsupportedOperationException` oluşturacağını belirtiyor. Yapıştırılan metin

Bu konu ileride kullanıcı yeni video eklediğinde tekrar önümüze gelecek.

---

# 10. Şimdi bütün Java kısmını okuyalım

Artık şu kod sana daha anlamlı gelmeli:

```
record Video(String name) {}

List<Video> videos = List.of(
    new Video("Video 1"),
    new Video("Video 2"),
    new Video("Video 3")
);
```

Bunu Türkçe oku:

> `Video` diye bir veri tipi tanımladım.
>
> Her `Video` bir `String name` taşıyor.
>
> Üç tane ayrı `Video` object’i oluşturdum.
>
> Bunları `List<Video>` tipindeki `videos` isimli reference üzerinden tutuyorum.

İşte bu bölümün **Pure Java tarafı**.

---

# 11. Şimdi Spring yeniden geliyor: `Model`

Controller şu hale geliyor:

```
@Controller
public class HomeController {

    record Video(String name) {}

    List<Video> videos = List.of(
        new Video("Video 1"),
        new Video("Video 2"),
        new Video("Video 3")
    );

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("videos", videos);
        return "index";
    }
}
```

Şimdi yeni şey:

```
Model model
```

Az önce parametreyi öğrenmiştik.

Mesela:

```
public void selamla(String isim)
```

buradaki:

```
String isim
```

metot parametresidir.

Aynı şekilde:

```
public String index(Model model)
```

buradaki:

```
Model model
```

bir parametre.

Tipi:

```
Model
```

değişken adı:

```
model
```

---

# 12. Peki `Model` object'ini kim oluşturuyor?

Biz şunu yapmadık:

```
Model model = new ...
```

Çünkü Spring MVC controller metodunu çağırırken bize uygun `Model` nesnesini sağlıyor. Yapıştırılan metin

Yani kabaca Spring şunu yapıyor gibi düşün:

```
Spring:
"index metodunu çağıracağım.
Bu metodun Model istediğini gördüm.
Tamam, gerekli Model nesnesini ben vereyim."
```

Ve:

```
index(model);
```

çağrısı gerçekleşiyor.

---

# 13. `model.addAttribute("videos", videos)` ne yapıyor?

Burası çok önemli.

```
model.addAttribute("videos", videos);
```

İki tane `videos` görüyorsun.

Ama aynı şey değiller.

Birincisi:

```
"videos"
```

tırnaklı.

Bu bir **String**.

Mustache tarafına vereceğimiz isim.

İkincisi:

```
videos
```

tırnaksız.

Bu bizim gerçek Java değişkenimiz:

```
List<Video> videos
```

Yani:

```
model.addAttribute("videos", videos);
```

şunu söylüyor:

> “Ey Model, benim gerçek Java `videos` listemi al. View tarafında buna `"videos"` ismiyle erişilsin.”

Kaynak da tam olarak bu ayrımı yapıyor. Yapıştırılan metin

Mesela şöyle de yapabilirdik:

```
model.addAttribute("videoListesi", videos);
```

Java'daki değişken hâlâ:

```
videos
```

ama HTML/Mustache tarafındaki adı:

```
videoListesi
```

olurdu.

---

# 14. Sonra yine `return "index"`

Metodumuz:

```
public String index(Model model) {

    model.addAttribute("videos", videos);

    return "index";
}
```

Artık iki farklı şey yapıyor.

Şu:

```
model.addAttribute("videos", videos);
```

→ **View'a kullanacağı veriyi veriyor.**

Şu:

```
return "index";
```

→ **Hangi view kullanılacak onu söylüyor.**

Bu ayrım çok önemli. Kaynakta da özellikle:

```
model.addAttribute → görünümün verisi
return "index"     → görünümün adı
```

şeklinde ayrılıyor. Yapıştırılan metin

Yani:

```
return "index";
```

ile videoları döndürmüyoruz.

Videolar:

```
model.addAttribute(...)
```

ile taşınıyor.

---

# 15. Mustache tarafı şimdi anlam kazanıyor

HTML şablonumuz:

```
<ul>
    {{#videos}}
        <li>{{name}}</li>
    {{/videos}}
</ul>
```

İlk satır:

```
{{#videos}}
```

şunu söylüyor:

> Model'in içinde `"videos"` adıyla verdiğin şeyi bul.

Biz nerede vermiştik?

```
model.addAttribute("videos", videos);
```

İşte bağlantı:

```
JAVA

model.addAttribute("videos", videos)
                    │
                    │ isim eşleşmesi
                    ↓

MUSTACHE

{{#videos}}
```

---

# 16. Mustache listeyi dolaşıyor

Bizim Java listemizde:

```
Video 1
Video 2
Video 3
```

var.

Mustache:

```
{{#videos}}
    <li>{{name}}</li>
{{/videos}}
```

bölümünü **her Video object'i için tekrar çalıştırıyor.**

İlk object:

```
new Video("Video 1")
```

olunca:

```
{{name}}
```

→ `"Video 1"`

İkinci object:

```
new Video("Video 2")
```

→ `"Video 2"`

Sonra üçüncü.

Kaynakta da Mustache bölümünün listedeki her eleman için tekrar işlendiği belirtiliyor. Yapıştırılan metin

---

# 17. `{{name}}` record'daki `name` ile bağlantılı

Record:

```
record Video(String name) {}
```

Java tarafında:

```
video.name()
```

ile okuyabiliyoruz.

Mustache tarafında ise:

```
{{name}}
```

yazıyoruz.

Mustache bizim yerimize ilgili değeri buluyor. Kaynakta kullanılan Java Mustache implementasyonunun `name()` gibi parametresiz erişim metodunu kullanabildiği açıklanıyor. Yapıştırılan metin

Dolayısıyla bağlantı:

```
record Video(String name)
                    │
                    ↓
              video.name()
                    │
                    ↓
              {{name}}
```

---

# 18. Şimdi en baştan sona tüm hikâye

Artık bütün Part'ı tek seferde okuyabilirsin.

Java'da önce:

```
record Video(String name) {}
```

ile `Video` tipini tanımladık.

Sonra:

```
new Video("Video 1")
```

ile gerçek `Video` object’leri oluşturduk.

Bunları:

```
List<Video>
```

içinde tuttuk.

Controller çalışınca Spring:

```
index(Model model)
```

metodunu çağırdı.

Biz:

```
model.addAttribute("videos", videos);
```

ile gerçek Java listesini view'a verdik.

Sonra:

```
return "index";
```

ile:

> `index` view'ını kullan.

dedik.

Spring `index.mustache` dosyasını aldı.

Mustache:

```
{{#videos}}
```

ile listeyi buldu.

Her `Video` için:

```
{{name}}
```

değerini çıkardı.

En sonunda üretilen HTML tarayıcıya gitti. Kaynağın verdiği tam akış da `GET / → index(model) → model verisi → "index" → Mustache → HTML → tarayıcı` şeklinde. Yapıştırılan metin

Zihnindeki son resim şu olsun:

```
JAVA

record Video(String name)
        ↓
new Video(...)
        ↓
List<Video> videos
        ↓
model.addAttribute("videos", videos)


             ↓


SPRING MVC

return "index"
        ↓
index.mustache


             ↓


MUSTACHE

{{#videos}}
    {{name}}
{{/videos}}


             ↓


HTML

<ul>
    <li>Video 1</li>
    <li>Video 2</li>
    <li>Video 3</li>
</ul>


             ↓

TARAYICI
```

Şu anda senden yalnızca üç cümleyi gerçekten anlamanı istiyorum:

**`record Video(String name) {}` bir object oluşturmaz; `Video` adında bir tip tanımlar.**

**`new Video("Java")` o tipten gerçek bir object oluşturur.**

**`model.addAttribute("videos", videos)` Java'daki listeyi view'ın kullanabileceği veriye dönüştürmez; o Java nesnesini view oluşturma sürecine `"videos"` adıyla sunar. Mustache daha sonra bu veriyi kullanarak HTML üretir.**

Bunlar oturduysa bu partın zor tarafını geçmiş durumdasın. Bir sonraki mantıksal adım artık `List<Video>`, generic ve interface bağlantısını birkaç küçük saf Java örneğiyle pekiştirmek; çünkü hemen ardından `VideoService` ve dependency injection geldiğinde bunları kullanacağız.

----

----

Buradaki asıl amaç şu:

> **Java’da oluşturduğumuz veriyi HTML sayfasında göstermek.**

Yani bu partta aslında üç şeyi birbirine bağlıyoruz:

```
JAVA VERİSİ
    ↓
MODEL
    ↓
HTML / MUSTACHE
```

Senin kafanı karıştıran `Model` tam ortadaki **köprü**.

## Önce neden bütün bunları yapıyoruz?

HTML'e videoları elle yazabilirdik:

```
<ul>
    <li>Java öğreniyorum</li>
    <li>Spring öğreniyorum</li>
</ul>
```

Ama gerçek backend uygulamasında veri böyle sabit olmayacak.

İleride veri:

```
Database
↓
Repository
↓
Service
↓
Controller
↓
HTML
```

şeklinde gelecek.

Şimdilik veritabanımız olmadığı için sahte veriyi Java'da oluşturuyoruz:

```
List<Video> videos = List.of(
    new Video("Java öğreniyorum"),
    new Video("Spring öğreniyorum")
);
```

Amacımız:

> Bu Java listesini `index.mustache` sayfasında göstermek.

İşte `Model` bunun için var. Ders materyalinde de `Model`, görünüm oluşturulurken kullanılacak verileri taşımak için kullanılan Spring MVC yapısı olarak anlatılıyor. Yapıştırılan metin

---

# Model nedir?

Şimdilik `Model`'i **bir çanta** gibi düşün.

Controller Java'daki verileri bu çantaya koyuyor.

Sonra Spring bu çantayı HTML şablonuna götürüyor.

Mesela elimizde:

```
List<Video> videos = ...
```

var.

Sonra:

```
model.addAttribute("videos", videos);
```

yazıyoruz.

Bunun Türkçesi:

> “Model çantasına benim `videos` listemi koy. Bu verinin şablondaki adı `"videos"` olsun.”

Yani:

```
MODEL ÇANTASI

"videos"  →  [Video1, Video2, Video3]
```

---

# Şu satırı kelime kelime açalım

```
model.addAttribute("videos", videos);
```

Burada üç şey var.

### `model`

Bu elimizdeki Model nesnesi:

```
model
```

### `addAttribute`

Model'in içine veri ekleyen metot:

```
addAttribute(...)
```

### `"videos", videos`

Burada çok önemli bir ayrım var:

```
"videos"
```

bir **String**, yani isim/anahtar.

Ama:

```
videos
```

gerçek Java değişkeni.

Yani:

```
model.addAttribute("videos", videos);
```

şu anlama geliyor:

```
isim:
"videos"

bu ismin altında saklanan gerçek veri:
videos Java listesi
```

Kaynakta da bu iki parçanın farklı görevlerde olduğu özellikle açıklanıyor. Yapıştırılan metin

---

# Neden bir isim vermemiz gerekiyor?

Çünkü Mustache'ın veriyi bulabilmesi lazım.

Java'da:

```
model.addAttribute("videos", videos);
```

diyoruz.

Mustache'da:

```
{{#videos}}
    <li>{{name}}</li>
{{/videos}}
```

yazıyoruz.

Bağlantıyı yapan kelime:

```
"videos"
```

Bak:

```
JAVA

model.addAttribute("videos", videos)
                    │
                    │
                    ↓
MUSTACHE

{{#videos}}
```

Mustache:

> Bana `"videos"` isminde bir veri verilmiş mi?

diye bakıyor.

Evet.

Model'in içinde var.

Sonra o listeyi dolaşıyor.

---

# Peki Model nereden geldi?

Kod:

```
public String index(Model model)
```

Burada:

```
Model
```

tip.

```
model
```

değişken.

Ama biz şunu yazmadık:

```
Model model = new Model();
```

Hatta bunu doğrudan yapamazdın çünkü Spring'deki `Model` bir **interface**.

Bak, az önce öğrendiğimiz interface konusu burada gerçek hayatta karşına çıktı.

```
public String index(Model model)
```

şunu söylüyor:

> “Bu metodu çalıştıracaksan bana `Model` sözleşmesine uyan bir nesne ver.”

Spring de diyor ki:

> “Tamam, ben sana uygun gerçek Model implementasyonunu vereceğim.”

Yani kabaca:

```
Sen:
index(Model model) istiyorum

Spring:
Tamam, sana Model interface'ini implement eden
gerçek bir object veriyorum.
```

Bu yüzden:

```
model.addAttribute(...)
```

kullanabiliyoruz.

---

# Çok önemli: Model bizim videolarımız değil

Bu ayrımı yap.

Şu:

```
videos
```

gerçek veri.

Şu:

```
model
```

veriyi HTML tarafına taşımak için kullandığımız taşıyıcı.

Şöyle:

```
videos
↓
GERÇEK VERİ

model
↓
BU VERİYİ VIEW'A TAŞIYAN KÖPRÜ
```

Örneğin:

```
List<Video> videos = List.of(...);
```

verimiz.

Sonra:

```
model.addAttribute("videos", videos);
```

ile veriyi Model'e koyuyoruz.

---

# Sonra `return "index"` neden ayrıca var?

Çünkü Spring'in iki ayrı şeyi bilmesi gerekiyor:

**1. Hangi veri kullanılacak?**

```
model.addAttribute("videos", videos);
```

**2. Hangi HTML şablonu kullanılacak?**

```
return "index";
```

Yani:

```
public String index(Model model) {

    model.addAttribute("videos", videos);

    return "index";
}
```

şunu söylüyor:

```
VERİ:
videos listesini kullan

VIEW:
index.mustache kullan
```

Kaynakta da bu ayrım özellikle yapılıyor: Model'e eklenen şey görünümün verisi, `return "index"` ise kullanılacak görünümün adı. Yapıştırılan metin

---

# Bir restoran benzetmesiyle düşün

Bence bunu aklında çok rahat tutarsın.

`videos`:

> Yemek.

`Model`:

> Garsonun taşıdığı tepsi.

`index.mustache`:

> Müşterinin masası.

Controller şunu yapıyor:

```
model.addAttribute("videos", videos);
```

yani:

> “Bu yemekleri tepsiye koy.”

Sonra:

```
return "index";
```

diyor:

> “Bu tepsiyi `index` masasına götür.”

Mustache da tepsiden verileri alıyor ve HTML üretiyor.

---

# Baştan sona tek akış

Sen tarayıcıya:

```
localhost:8080/
```

yazıyorsun.

Spring:

```
@GetMapping("/")
```

eşleşmesini görüyor.

Sonra:

```
index(Model model)
```

metodunu çağırıyor ve Model nesnesini kendisi sağlıyor.

Controller:

```
model.addAttribute("videos", videos);
```

diyor.

Artık Model'in içinde:

```
"videos" → Java'daki Video listesi
```

var.

Sonra:

```
return "index";
```

diyor.

Spring:

```
index
↓
index.mustache
```

şablonunu buluyor.

Mustache:

```
{{#videos}}
```

ile Model'deki `"videos"` verisini buluyor.

Her `Video` için:

```
{{name}}
```

değerini çıkarıyor.

Sonuç:

```
<ul>
    <li>Java öğreniyorum</li>
    <li>Spring öğreniyorum</li>
</ul>
```

Tarayıcıya **bu HTML** gönderiliyor. Tarayıcıya Java `Model` nesnesi gönderilmiyor. Kaynağın akışı da `GET / → index(model) → Model'e videos → index.mustache → HTML → tarayıcı` şeklinde. Yapıştırılan metin

## Şimdilik sadece bunu bil

```
List<Video> videos
```

= **verim**

```
Model model
```

= **veriyi HTML şablonuna taşıdığım kutu/köprü**

```
model.addAttribute("videos", videos);
```

= **Java listesini Model'e `"videos"` adıyla koy**

```
return "index";
```

= **bu verilerle `index.mustache` görünümünü oluştur**

Bence seni asıl rahatlatacak bilgi de şu: **`Model model` satırında az önce öğrendiğin interface konusu gerçekten kullanılıyor. `Model` bir interface; Spring sana onun gerçek implementasyonunu veriyor.** Bu yüzden `new Model()` yazmıyorsun.



----

---

**Önce Java temelini kuracağız; ardından Part 4 ve Part 5’i birlikte yeniden yazacağız.** Her aşamada kodun ne yaptığını açıklayıp küçük bir değişikliği kendin yapabildiğini göreceğiz.

Gönderdiğin iki partı ve yol haritamızı okudum. Anlatımda nesne, referans, constructor, metot ve liste bilgisi üzerine Spring davranışları eklenmiş. Java tarafını yeterince açmadan ilerlemişiz. Özellikle şu ifadeler, birkaç kavramı aynı anda bilmeyi gerektiriyor:

```
Video newVideo
```

```
return videoService.create(newVideo);
```

```
List<Video> extend = new ArrayList<>(videos);
```

Bunları küçük adımlarla kuracağız. Çalışma sıramız şöyle:

1. **Tek bir video oluşturmak ve adını okumak.**
2. **Bir videoyu metoda göndermek ve metottan sonuç almak.** Burada servis, constructor, `this` ve `return` yerleşecek.
3. **Videoları listede tutmak ve listeyi güncellemek.** `List<Video>`, `ArrayList`, `List.of`, `List.copyOf` ve `final` burada açıklanacak.
4. **Part 4’ü yeniden yazmak:** HTML formundan gelen verinin Java koduna ulaşmasını izlemek.
5. **Part 5’i yeniden yazmak:** JSON’dan Java nesnesine, Java nesnesinden JSON’a geçişi izlemek.

**Şimdi ilk adımı gerçekten çalışalım. Bu mesajdaki hedefimiz tek bir `Video` oluşturup adını okuyabilmek.**

Önce şu tanıdık satırdan başlayalım:

```
String baslik = "Java temelleri";
```

Bunu şöyle okuyoruz:

> “`baslik` adında, metin türünde bir değişken tanımla ve ona `Java temelleri` değerini ata.”

| Parça              | Anlamı                                |
| ------------------ | ------------------------------------- |
| `String`           | Değişkenin türü: metin                |
| `baslik`           | Değişkene verdiğimiz isim             |
| `=`                | Sağdaki değeri soldaki değişkene atar |
| `"Java temelleri"` | Metin değeri                          |

Burada `baslik` ismini biz seçtik. Şöyle de yazabilirdik:

```
String videoAdi = "Java temelleri";
```

Değişkenin ismi değişti; metin değeri aynı kaldı.

Şimdi uygulamamızdaki ihtiyacı düşünelim. Bir videoyu temsil etmek istiyoruz. Bu örnekte video hakkında tuttuğumuz tek bilgi **adı**.

Java’ya bu veri türünü şöyle tanıtıyoruz:

```
record Video(String name) {}
```

Bunun anlamı:

> “`Video` adında bir veri türü tanımlıyorum. Her `Video`, `name` isimli bir metin bilgisi taşıyacak.”

**`record`, Java’da veri taşımaya uygun özel bir sınıf biçimidir.** Bu tanım için nesneyi başlangıç değeriyle kuran constructor’ı ve adı okumamızı sağlayan `name()` metodunu Java otomatik oluşturur. Bunların görevini birazdan kodda göreceğiz. [docs.oracle.com](https://docs.oracle.com/en/java/javase/25/language/records.html?utm_source=chatgpt.com)

Burada üç şeyi ayıralım:

| Kavram                            | Bizim örneğimiz |
| --------------------------------- | --------------- |
| Tür                               | `Video`         |
| O türdeki nesnenin taşıdığı bilgi | `name`          |
| Bilginin türü                     | `String`        |

Bu satırla **video türünü tanımladık**. Henüz adı `Java temelleri` olan bir video oluşturmadık.

Şimdi onu oluşturalım:

```
Video ilkVideo = new Video("Java temelleri");
```

Satırı önce **sağdan** okuyalım:

```
new Video("Java temelleri")
```

> “Yeni bir `Video` nesnesi oluştur. Başlangıçtaki adı `Java temelleri` olsun.”

`new`, yeni nesne oluşturmak için kullanılıyor.

Parantez içindeki metin, oluşturulan videonun başlangıç bilgisidir. Nesnenin bu bilgiyle kurulmasını sağlayan yapıya **constructor**, yani kurucu denir.

Sonra soldaki bölüme bakalım:

```
Video ilkVideo
```

> “`Video` türündeki bir nesneye ulaşmak için `ilkVideo` adında bir değişken tanımla.”

İkisini birleştirince:

```
Video ilkVideo = new Video("Java temelleri");
```

> “Yeni bir video oluştur ve ona `ilkVideo` değişkeni üzerinden ulaşmamı sağla.”

**`ilkVideo`, videonun adı değildir.** Kod içinde nesneye ulaşmak için kullandığımız değişkenin adıdır. Videonun taşıdığı ad ise `"Java temelleri"` metnidir.

Bu ayrım, partlardaki `Video newVideo` ifadesini anlamamızın başlangıcı:

| İfade              | Görevi                                 |
| ------------------ | -------------------------------------- |
| `Video`            | Veri türünün adı                       |
| `ilkVideo`         | Bizim seçtiğimiz değişken adı          |
| `name`             | Video nesnesinin taşıdığı bilginin adı |
| `"Java temelleri"` | O bilginin değeri                      |

Şimdi oluşturduğumuz videonun adını okuyalım:

```
String okunanBaslik = ilkVideo.name();
```

Burada yine önce sağ taraf çalışır:

```
ilkVideo.name()
```

> “`ilkVideo` üzerinden ulaştığım nesnenin `name()` metodunu çalıştır.”

**Metot**, çağırabildiğimiz bir Java işlemidir. Bu metot, videonun adını okuyup bize bir `String` sonuç verir.

Nokta, hangi nesne üzerinden işlem yaptığımızı belirtir. `()` ise metodun çağrıldığını gösterir. Burada parantezin içine bir şey yazmadık; videonun mevcut adını okumak için ek bilgi vermemiz gerekmiyor.

Dolayısıyla:

```
String okunanBaslik = ilkVideo.name();
```

çalıştıktan sonra `okunanBaslik` değişkeninin değeri:

```
Java temelleri
```

olur.

Bu işlem yeni bir video oluşturmaz. Var olan videonun adını okur.

Bir de **referans** kelimesini somutlaştıralım:

```
Video digerIsim = ilkVideo;
```

Bu satırda `new` yok. Yeni bir video oluşturmadık. `ilkVideo` değişkenindeki nesne referansını `digerIsim` değişkenine kopyaladık.

Artık iki değişken üzerinden **aynı video nesnesine** ulaşabiliriz:

| İfade              | Okunan değer     |
| ------------------ | ---------------- |
| `ilkVideo.name()`  | `Java temelleri` |
| `digerIsim.name()` | `Java temelleri` |

Referansı şimdilik şöyle düşün:

> “Bu nesneye ulaşmamı sağlayan bağlantı.”

Bu bağlantı fikri, daha sonra controller’ın servisi nasıl kullandığını ve listelerin nasıl kopyalandığını anlamamızı sağlayacak.

Şimdi bunları çalıştırabileceğin küçük bir denemede birleştirelim. Mevcut projende `Video.java` ile aynı pakette **`JavaDenemesi.java`** oluştur. Dosyanın en üstüne `Video.java` dosyandaki `package` satırının aynısını ekle:

```
public class JavaDenemesi {

    public static void main(String[] args) {
        String baslik = "Java temelleri";

        Video ilkVideo = new Video(baslik);

        String okunanBaslik = ilkVideo.name();

        System.out.println(okunanBaslik);
    }
}
```

Buradaki `main`, bu küçük Java programını başlattığımız yerdir. IntelliJ’de yanındaki çalıştırma düğmesini kullanabilirsin. `System.out.println(...)` ise verdiğimiz değeri konsola yazdırır.

Beklenen çıktı:

```
Java temelleri
```

Kodun içindeki adımlar sırayla şunlar:

1. Başlık metnini hazırladık.
2. Bu başlığı taşıyan bir video oluşturduk.
3. Videonun adını okuduk.
4. Okuduğumuz adı konsola yazdırdık.

**Şimdi senden küçük bir uygulama istiyorum.** `main` içindeki kodu değiştirerek:

- Adı `"İlk Java videom"` olan bir video oluştur.
- Ona ulaşmak için değişkenin adını `benimVideom` yap.
- Videonun adını `name()` ile okuyup konsola yazdır.

Yazdığın kodu ve şu iki sorunun cevabını gönder:

1. `Video benimVideom = new Video("İlk Java videom");` satırında **tür**, **değişken adı** ve **videonun taşıdığı ad** hangileri?
2. Ardından `Video ikinci = benimVideom;` yazarsan yeni bir video oluşur mu?

Cevaplarını birlikte inceleyeceğiz. Sonraki adımda bu videoyu bir metoda göndereceğiz; böylece Part 4 ve Part 5’teki **`create(newVideo)` ve `return`** ifadelerini kendi yazdığın kod üzerinden kuracağız.





----

---

Devam ediyoruz. 🙂 Önce önceki iki soruyu kapatalım:

- `Video benimVideom = new Video("İlk Java videom");` satırında **`Video` tür**, **`benimVideom` değişken adı**, **`"İlk Java videom"` nesnenin taşıdığı ad**.
- `Video ikinci = benimVideom;` yazdığımızda yeni video oluşmaz. İki değişken üzerinden **aynı nesneye** ulaşırız.

Şimdi bu nesneyi **bir metoda göndermeyi ve metottan sonuç almayı** öğreneceğiz. Bu çalışma, partlarda gördüğün `create(newVideo)` ve `return` ifadelerini anlamamızı sağlayacak.

**İlk ihtiyacımız şu: Bir video verelim, bir metot onun adını bize geri versin.**

Elimizdeki videoyu hatırlayalım:

```
Video benimVideom = new Video("İlk Java videom");
```

Bu videonun adını okuyabiliyoruz:

```
benimVideom.name()
```

Şimdi bu okuma işlemini kendi yazacağımız bir metodun içine yerleştirelim.

`Video.java` ile aynı pakette **`VideoAraci.java`** oluştur. En üstüne kendi `package` satırını ekle:

```
public class VideoAraci {

    public String adiOku(Video video) {
        return video.name();
    }
}
```

`VideoAraci`, bu küçük alıştırmada kullanacağımız sınıfın adı. İçinde `adiOku` isimli bir metot tanımladık.

Şimdi metodun ilk satırını okuyalım:

```
public String adiOku(Video video)
```

| Parça         | Anlamı                                      |
| ------------- | ------------------------------------------- |
| `public`      | Bu metodu sınıfın dışından da çağırabiliriz |
| `String`      | Metot, sonuç olarak bir metin döndürecek    |
| `adiOku`      | Metoda verdiğimiz isim                      |
| `Video video` | Metot, girdi olarak bir `Video` alacak      |

Bu satırın Türkçesi:

> “Bana bir `Video` ver. Ben sana sonuç olarak bir `String` vereceğim.”

Burada iki farklı türün görevi var:

- Parantez içindeki **`Video`**, metoda **giren verinin türü**.
- Metot adından önceki **`String`**, metottan **çıkan sonucun türü**.

Metodun içindeki işlem ise şu:

```
return video.name();
```

> “Gelen videonun adını oku ve bu adı beni çağıran koda sonuç olarak ver.”

**`return`, sonucu çağıran koda geri verir.** Konsola yazdırmak için ise `System.out.println(...)` kullanıyoruz. Bunlar iki ayrı işlem.

Şimdi bu metodu çağıralım. Önceki `JavaDenemesi.java` dosyandaki `main` bölümünü şöyle düzenle:

```
public class JavaDenemesi {

    public static void main(String[] args) {
        Video benimVideom = new Video("İlk Java videom");

        VideoAraci arac = new VideoAraci();

        String sonuc = arac.adiOku(benimVideom);

        System.out.println(sonuc);
    }
}
```

Buradaki yeni satırı açıklayalım:

```
VideoAraci arac = new VideoAraci();
```

Daha önce `new Video(...)` ile bir video nesnesi oluşturmuştuk. Burada da `new VideoAraci()` ile işlemlerimizi yapacağımız bir nesne oluşturuyoruz.

`arac`, o nesneye ulaşmak için kullandığımız değişken.

Ardından:

```
String sonuc = arac.adiOku(benimVideom);
```

Bu satırda önce sağdaki metot çağrısı tamamlanır. Ondan gelen sonuç soldaki değişkene atanır.

Çalışmayı sırayla izleyelim:

| Adım | Ne oluyor?                                                         |
| ---- | ------------------------------------------------------------------ |
| 1    | `arac` üzerinden `adiOku` metodunu çağırıyoruz                     |
| 2    | `benimVideom` üzerinden ulaştığımız videoyu metoda veriyoruz       |
| 3    | Metot içinde aynı videoya `video` parametresi üzerinden ulaşıyoruz |
| 4    | `video.name()` sonucu `"İlk Java videom"` oluyor                   |
| 5    | `return`, bu metni çağıran koda geri veriyor                       |
| 6    | Gelen metin `sonuc` değişkenine atanıyor                           |

En son:

```
System.out.println(sonuc);
```

ile konsola şunu yazdırıyoruz:

```
İlk Java videom
```

**Burada özellikle değişken isimlerine dikkat edelim.**

Metodu çağırırken:

```
arac.adiOku(benimVideom);
```

Metodu tanımlarken:

```
public String adiOku(Video video)
```

Bir tarafta `benimVideom`, diğer tarafta `video` yazıyor. İsimlerinin aynı olması gerekmiyor.

| Terim         | Bizim örneğimiz                          |
| ------------- | ---------------------------------------- |
| **Parametre** | Metot tanımındaki `Video video`          |
| **Argüman**   | Çağrı sırasında verdiğimiz `benimVideom` |

Parametre, metodun girdisine verdiğimiz isimdir. Argüman, çağırırken sağladığımız değerdir.

Bu çağrıda nesnenin referansı parametreye kopyalanır. Metot içinde yeni bir `Video` oluşturmadık; aynı nesnenin adını okuduk.

Şimdi bir adım daha atalım: **Metot bir metin yerine bir `Video` döndürebilir mi?**

Evet. `VideoAraci` sınıfının içine şu ikinci metodu ekle:

```
public Video videoyuGeriVer(Video gelenVideo) {
    return gelenVideo;
}
```

Bu küçük metot:

> “Bana bir video ver. Verdiğin videoyu sana sonuç olarak geri vereyim.”

diyor.

Buradaki iki `Video` kelimesinin görevini ayıralım:

```
public Video videoyuGeriVer(Video gelenVideo)
```

| Konum                        | Görevi                                             |
| ---------------------------- | -------------------------------------------------- |
| Metot adından önceki `Video` | Sonucun türü                                       |
| Parantez içindeki `Video`    | Girdinin türü                                      |
| `gelenVideo`                 | Metot içinde girdiye ulaşacağımız parametrenin adı |

Metodun içinde:

```
return gelenVideo;
```

yazdık. Dolayısıyla sonuç, verilen video nesnesinin referansıdır.

Bunu `main` içinde şöyle kullanabiliriz:

```
Video benimVideom = new Video("Java metotları");

VideoAraci arac = new VideoAraci();

Video sonucVideo = arac.videoyuGeriVer(benimVideom);

System.out.println(sonucVideo.name());
```

Beklenen çıktı:

```
Java metotları
```

**Bu örnekte yalnızca bir video nesnesi var.** `benimVideom`, metodun içindeki `gelenVideo` ve sonrasında `sonucVideo` üzerinden aynı nesneye ulaşıyoruz.

Şimdi parttaki şu satırın Java kısmını okuyabiliriz:

```
public Video create(Video newVideo)
```

Anlamı:

> “`create` isimli metot, girdi olarak bir `Video` alır ve sonuç olarak bir `Video` döndürür.”

`create`, metoda verilmiş isimdir. Video ekleme işlemini gerçekleştiren şey, bu metodun **içine yazılmış kod**dur. O liste kodunu sonraki çalışmalarda kuracağız.

Çağrı ise şöyle olabilir:

```
Video eklenenVideo = videoService.create(newVideo);
```

> “`videoService` üzerinden `create` metodunu çalıştır. Ona `newVideo` değerini ver. Gelen sonucu `eklenenVideo` değişkenine ata.”

Part 5’te bunu tek satırda görmüştük:

```
return videoService.create(newVideo);
```

Öğrenmek için iki satıra açalım:

```
Video eklenenVideo = videoService.create(newVideo);
return eklenenVideo;
```

İki yazım da burada aynı işi yapıyor:

1. Servisin `create` metodu çalışıyor.
2. Servisten gelen sonuç, içinde bulunduğumuz metodun sonucu olarak geri veriliyor.

Part 4’te ise şu çağrı vardı:

```
videoService.create(newVideo);
```

Burada da metot çalışır. Fakat çağıran kod, dönen sonucu bir değişkene atamaz veya başka bir yere döndürmez. **Sonucu kullanmamak, metodun çalışmasını engellemez.**

Şimdi küçük bir uygulama yapalım. `VideoAraci` sınıfındaki iki metodu kullanarak `main` içinde:

1. Adı `"Metotları öğreniyorum"` olan bir video oluştur.
2. `videoyuGeriVer(...)` metodunu çağırıp sonucunu bir `Video` değişkenine ata.
3. Bu sonuç videosunu `adiOku(...)` metoduna gönder.
4. Gelen metni konsola yazdır.

Beklediğimiz çıktı:

```
Metotları öğreniyorum
```

Kodunu yazarken şu iki soruyu da düşün:

- `adiOku(...)` ile `videoyuGeriVer(...)` metotlarının **dönüş türleri neden farklı?**
- Bir metodun içinde `return gelenVideo;` yazmak **yeni bir video oluşturur mu?**

Yazdığın kodu birlikte inceleyelim. Ardından aynı nesne ve metot mantığıyla **constructor, `this` ve controller’ın servisi kullanması** kısmını kuracağız.



----

----

Devam ediyoruz. 🙂 Şimdi **bir nesnenin başka bir nesneyi nasıl kullandığını** kuracağız. Bu, `HomeController` içindeki constructor ve `this.videoService = videoService;` satırını anlamamızı sağlayacak.

Önce önceki iki soruyu kapatalım:

- `adiOku(...)`, videonun **adını** verdiği için `String` döndürüyordu. `videoyuGeriVer(...)`, **videonun kendisine ulaşacağımız referansı** verdiği için `Video` döndürüyordu.
- `return gelenVideo;` yeni bir video oluşturmaz. Metoda verilmiş nesnenin referansını geri verir.

Şimdi elimizde önceki dersten şu sınıf var:

```
public class VideoAraci {

    public String adiOku(Video video) {
        return video.name();
    }

    public Video videoyuGeriVer(Video gelenVideo) {
        return gelenVideo;
    }
}
```

Bu sınıftan bir nesne oluşturup kullanabiliyoruz:

```
VideoAraci arac = new VideoAraci();
```

**Yeni ihtiyacımız şu: `VideoEkrani` adında başka bir sınıf olsun ve video adını hazırlarken `VideoAraci` nesnesini kullansın.**

Bunu kurmak için `Video.java` ve `VideoAraci.java` ile aynı pakette **`VideoEkrani.java`** oluştur. En üstüne kendi `package` satırını ekle:

```
public class VideoEkrani {

    private final VideoAraci arac;

    public VideoEkrani(VideoAraci gelenArac) {
        this.arac = gelenArac;
    }

    public String basligiGetir(Video video) {
        return arac.adiOku(video);
    }
}
```

Şimdi bu sınıfı parça parça okuyalım.

İlk satırımız:

```
private final VideoAraci arac;
```

Bu değişken, bir metodun içinde değil; doğrudan sınıfın içinde tanımlanmış.

Buna **field**, yani **alan** diyoruz. Burada her `VideoEkrani` nesnesinin kendi `arac` alanı bulunur.

Bu alanın amacı:

> “Bu ekranın kullanacağı `VideoAraci` nesnesine ait referansı tutmak.”

Daha önce `main` içinde oluşturduğumuz değişkenlerle farkını görelim:

| Nerede tanımlanıyor?          | Görevi                                                       |
| ----------------------------- | ------------------------------------------------------------ |
| `main` içinde bir değişken    | O metot içinde kullanılır                                    |
| Constructor’ın parametresi    | Constructor içinde gelen değere ulaşmamızı sağlar            |
| Sınıfın içindeki `arac` alanı | Nesnenin içinde tutulur; nesnenin metotları onu kullanabilir |

Buradaki `private`, alana sınıfın dışından doğrudan erişimi sınırlar. `VideoEkrani` sınıfının kendi metotları bu alanı kullanabilir.

`final` kısmını, alanın nasıl doldurulduğunu gördükten sonra açıklayacağız.

**Şimdi constructor’a gelelim:**

```
public VideoEkrani(VideoAraci gelenArac) {
    this.arac = gelenArac;
}
```

Constructor, yeni nesne kurulurken çalışır ve nesnenin başlangıç durumunu hazırlar.

Constructor’ı tanımak için iki işarete bak:

- Adı, sınıfın adıyla aynıdır: **`VideoEkrani`**.
- Önünde `String`, `Video` veya `void` gibi bir dönüş türü bulunmaz.

Şunları karşılaştır:

```
public String basligiGetir(Video video)
```

Bu bir **metot**. Sonuç türü `String`.

```
public VideoEkrani(VideoAraci gelenArac)
```

Bu bir **constructor**. Sınıfın adıyla aynı adı taşıyor ve dönüş türü yok.

Bu constructor şunu bekliyor:

> “Bir `VideoEkrani` oluştururken bana kullanacağım `VideoAraci` nesnesini ver.”

Şimdi onu gerçekten oluşturalım:

```
VideoAraci mevcutArac = new VideoAraci();

VideoEkrani ekran = new VideoEkrani(mevcutArac);
```

İlk satırda bir `VideoAraci` nesnesi oluşturduk.

İkinci satırda bir `VideoEkrani` nesnesi oluşturuyoruz. Parantezin içine `mevcutArac` yazarak, önceden oluşturduğumuz araç nesnesinin referansını constructor’a veriyoruz.

Constructor çalışırken bu referansa şu parametreyle ulaşılıyor:

```
VideoAraci gelenArac
```

Ardından şu atama yapılıyor:

```
this.arac = gelenArac;
```

**`this`, o anda üzerinde çalıştığımız nesneyi ifade eder.** Burada kurulan `VideoEkrani` nesnesidir.

Dolayısıyla:

| İfade                    | Anlamı                                |
| ------------------------ | ------------------------------------- |
| `this.arac`              | Kurulan ekran nesnesinin `arac` alanı |
| `gelenArac`              | Constructor’a verilmiş parametre      |
| `this.arac = gelenArac;` | Gelen referansı ekranın alanına ata   |

Satırın Türkçesi:

> “Dışarıdan verilen araç nesnesini, bu ekranın kullanacağı araç olarak sakla.”

Bu atamada araç nesnesini kopyalamıyoruz. Ekranın alanında da **aynı araç nesnesine ulaşan referans** tutuluyor.

Constructor tamamlandıktan sonra ekranın metotları bu alanı kullanabilir:

```
public String basligiGetir(Video video) {
    return arac.adiOku(video);
}
```

Buradaki `arac`, ekranın alanıdır. Metot şu işlemi yapıyor:

> “Bana verilen videoyu, tuttuğum araç nesnesinin `adiOku` metoduna gönder. Gelen metni sonuç olarak geri ver.”

Şimdi bütün bağlantıyı çalıştıralım. `JavaDenemesi.java` dosyandaki `main` bölümünü şöyle düzenle:

```
public class JavaDenemesi {

    public static void main(String[] args) {
        Video benimVideom = new Video("Constructor öğreniyorum");

        VideoAraci mevcutArac = new VideoAraci();

        VideoEkrani ekran = new VideoEkrani(mevcutArac);

        String baslik = ekran.basligiGetir(benimVideom);

        System.out.println(baslik);
    }
}
```

Beklenen çıktı:

```
Constructor öğreniyorum
```

Çağrının izlediği yolu okuyalım:

1. `ekran.basligiGetir(benimVideom)` çağrılıyor.
2. Ekran, kendi alanında tuttuğu `arac` üzerinden `adiOku(video)` metodunu çağırıyor.
3. Araç, videonun adını okuyup geri veriyor.
4. Ekranın metodu da gelen adı geri veriyor.
5. Sonuç `baslik` değişkenine atanıp konsola yazdırılıyor.

Burada üç ayrı nesne oluşturduk: bir **video**, bir **araç**, bir **ekran**. Ekran, oluşturduğumuz araç nesnesini kullanıyor.

**Şimdi constructor’daki isimleri aynı yapalım.** Kitapta karşımıza çıkan yazım bu:

```
private final VideoAraci arac;

public VideoEkrani(VideoAraci arac) {
    this.arac = arac;
}
```

Bu kod öncekiyle aynı işi yapıyor. Yalnızca constructor parametresinin adını `gelenArac` yerine `arac` yaptık.

Atama satırında iki `arac` farklı yerleri ifade ediyor:

```
this.arac = arac;
```

- **Soldaki `this.arac`:** Nesnenin alanı.
- **Sağdaki `arac`:** Constructor parametresi.

İsimler aynı olduğu için `this`, hangi değişkenden söz ettiğimizi açıkça ayırıyor.

Sadece:

```
arac = arac;
```

yazsaydık iki tarafta da parametre seçilirdi. Nesnenin alanına atama yapılmazdı. Bu örnekte `final` alan başlangıç değeri almadan kalacağı için derleme hatası oluşurdu.

**Peki buradaki `final` ne yapıyor?**

```
private final VideoAraci arac;
```

Bu alanın referansının bir kez atanmasını sağlar. Biz ilk atamayı constructor içinde yaptık.

Sonradan bu alanı başka bir araç nesnesine yeniden atayamayız:

```
this.arac = new VideoAraci();
```

Ama mevcut araç üzerinden metot çağırabiliriz:

```
arac.adiOku(video);
```

**Buradaki `final`, referansın yeniden atanmasını engeller. Referansın gösterdiği nesnenin bütün iç verilerini değişmez yapmaz.**

Bu ayrım gerçek servisimiz için de geçerli: Controller’ın kullandığı servis aynı kalabilir; servis kendi tuttuğu video verisini güncelleyebilir.

Şimdi Part 4 ve Part 5’teki gerçek constructor bölümünü okuyalım:

```
private final VideoService videoService;

public HomeController(VideoService videoService) {
    this.videoService = videoService;
}
```

Az önce öğrendiğimiz yapıyla eşleştirelim:

| Alıştırmamız        | Gerçek uygulamamız                  |
| ------------------- | ----------------------------------- |
| `VideoEkrani`       | `HomeController`                    |
| `VideoAraci`        | `VideoService`                      |
| `this.arac = arac;` | `this.videoService = videoService;` |

Controller kurulurken bir `VideoService` referansı alıyor ve bunu kendi alanında tutuyor. Daha sonra metotlarında:

```
videoService.create(newVideo);
```

gibi çağrılar yapabiliyor.

**Spring’in burada üstlendiği iş, uygun servis nesnesini controller’ın constructor’ına sağlamaktır.** Bu yaklaşımın adı **constructor injection**, yani bağımlılığın constructor üzerinden verilmesidir. [docs.spring.io](https://docs.spring.io/spring-framework/reference/core/beans/dependencies/factory-collaborators.html?utm_source=chatgpt.com)

Biz bağlantıyı Java ile elle kurabiliriz:

```
VideoService servis = new VideoService();

HomeController controller = new HomeController(servis);
```

Spring kullandığımız düzende ise Spring, yönettiği nesnelerin oluşturulmasını ve bu bağlantının kurulmasını yönetir. Spring’in yönettiği Java nesnesine **bean** denir.

Mevcut projemizde taranan paketteki `@Service` ve `@Controller` tanımları bu nesnelerin Spring tarafından bulunmasını sağlıyor. `HomeController` tek constructor’a sahip olduğu için ayrıca constructor’ın üzerine `@Autowired` yazmamız gerekmiyor. [docs.spring.io](https://docs.spring.io/spring-framework/reference/core/beans/annotation-config/autowired.html?utm_source=chatgpt.com)

Şimdi küçük uygulaman: `VideoEkrani` constructor’ındaki parametrenin adını **`yardimci`** yap. Alanın adı **`arac`** olarak kalsın. Atama satırını buna göre düzelt ve programı çalıştır.

Ardından şu üç soruyu cevaplayalım:

1. Constructor parametresi ile nesnenin alanı arasındaki fark nedir?
2. `new VideoEkrani(mevcutArac)` çağrısı, yeni bir `VideoAraci` nesnesi de oluşturur mu?
3. `private final VideoService videoService;` yazmamız, servisin video verisini güncellemesini engeller mi?

Sonraki adımda **`List<Video>` ve `ArrayList`** üzerine geçeceğiz. Böylece Part 4’teki listeyi kopyalayıp güncelleyen kodu kurabileceğiz.

-----

---

Devam ediyoruz. 🙂 **Şimdi Part 4’teki listeyi güncelleyen kodu adım adım kuracağız.** Önce bir video listesi oluşturacağız; sonra eski videoları ve yeni videoyu içeren listeyi hazırlayacağız.

Önce önceki üç soruyu kapatalım:

1. **Parametre**, constructor’a gelen değere constructor içinde ulaşmamızı sağlar. **Alan**, nesnenin içinde tutulur ve nesnenin metotları tarafından kullanılabilir.
2. `new VideoEkrani(mevcutArac)`, bir ekran oluşturur. Verdiğimiz araç nesnesinin referansını kullanır.
3. `final VideoService videoService`, controller’ın servis referansını yeniden atamasını engeller. Servisin kendi video verisini güncellemesine engel olmaz.

Şimdi tek bir videoyu hatırlayalım:

```
Video ilkVideo = new Video("Java temelleri");
```

Birden fazla video tutmak istediğimizde **liste** kullanabiliriz:

```
List<Video> videos = new ArrayList<>();
```

Bu satırın anlamı:

> “Video elemanlarıyla çalışacağım boş bir liste oluştur ve ona `videos` değişkeni üzerinden ulaş.”

Parçalarını ayıralım:

| Parça               | Görevi                                          |
| ------------------- | ----------------------------------------------- |
| `List<Video>`       | Değişkenin türü: Video listesi                  |
| `videos`            | Değişkenin adı                                  |
| `new ArrayList<>()` | Yeni, boş bir liste nesnesi oluşturur           |
| `=`                 | Oluşturulan nesnenin referansını değişkene atar |

**`<Video>` ne anlatıyor?**

Listeyle çalışırken eleman türünün `Video` olacağını belirtiyor.

Bu tür belirtme mekanizmasına **generics** denir. Buradaki kullanımıyla Java’ya şunu söylüyoruz:

> “Bu listeye ekleyeceğim ve bu listeden okuyacağım elemanlar `Video` türünde olacak.”

Örneğin:

```
videos.add(new Video("Java temelleri"));
```

uygundur.

Şunu yazarsak:

```
videos.add("Java temelleri");
```

derleme hatası alırız. Çünkü metoda bir `String` verdik; bu liste `Video` elemanlarıyla çalışıyor.

Videonun **adı** bir `String`. Listenin elemanı ise o adı taşıyan **`Video` nesnesinin referansı**.

Şimdi `List` ile `ArrayList` arasındaki ilişkiyi açıklayalım.

**`List`, bir interface’tir; Türkçesi arayüzdür.** Listeyle hangi metotlar üzerinden çalışabileceğimizi tanımlar.

**`ArrayList`, bu arayüzü uygulayan somut bir sınıftır.** Bizim oluşturduğumuz liste nesnesinin davranışını sağlar.

Dolayısıyla:

```
List<Video> videos = new ArrayList<>();
```

satırında:

- Solda, değişken üzerinden listeyle çalışacağımız türü belirtiyoruz.
- Sağda, kullanacağımız gerçek liste nesnesini oluşturuyoruz.

Sağdaki `<>` sayesinde Java, eleman türünü soldaki `List<Video>` bilgisinden çıkarabilir. Şu yazım da aynı işi yapar:

```
List<Video> videos = new ArrayList<Video>();
```

Şimdi listeye iki video ekleyelim:

```
videos.add(new Video("Java temelleri"));
videos.add(new Video("Spring Boot"));
```

`add(...)`, bu `ArrayList` listesinin sonuna eleman ekler.

İki satır çalıştıktan sonra listeyi şöyle düşünebiliriz:

| Konum — index | Video adı      |
| ------------- | -------------- |
| `0`           | Java temelleri |
| `1`           | Spring Boot    |

Liste konumları **sıfırdan başlar**.

İlk videoya ulaşmak için:

```
Video ilkVideo = videos.get(0);
```

İlk videonun adını okumak için:

```
String ilkBaslik = ilkVideo.name();
```

Burada iki ayrı işlem yaptık:

1. `get(0)` ile listedeki ilk videoya ulaştık.
2. `name()` ile o videonun adını okuduk.

Eleman sayısını öğrenmek için de:

```
int adet = videos.size();
```

kullanabiliriz. Şu anda `adet` değeri `2` olur.

**Şimdi kitaptaki başlangıç listesinin farklı özelliğine gelelim.**

Serviste listeyi şu yaklaşımla oluşturmuştuk:

```
List<Video> videos = List.of(
    new Video("Java temelleri"),
    new Video("Spring Boot")
);
```

`List.of(...)`, verdiğimiz elemanları içeren bir liste sağlayan hazır bir metottur.

Bu bir **static metot** olduğu için onu doğrudan `List` adı üzerinden çağırıyoruz.

Bu listenin önemli özelliği: **Eleman ekleme, çıkarma veya eleman değiştirme işlemlerini desteklemez.** Böyle bir listeye *unmodifiable*, yani değiştirilemeyen liste denir. [docs.oracle.com](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html?utm_source=chatgpt.com)

Dolayısıyla bu liste üzerinde:

```
videos.add(new Video("Docker"));
```

çalıştırırsak `UnsupportedOperationException` oluşur.

Bu hata şu anlama gelir:

> “Bu liste, istediğin değiştirme işlemini desteklemiyor.”

Burada önemli bir ayrım var: Değişkenin türü `List<Video>` olduğu için `add(...)` metodunu yazabiliriz. Ancak işlemin desteklenip desteklenmediği, kullandığımız liste nesnesine bağlıdır.

| Listeyi oluşturma biçimi | Eleman ekleyebilir miyiz? |
| ------------------------ | ------------------------- |
| `new ArrayList<>()`      | Evet                      |
| `List.of(...)`           | Hayır                     |

**Peki başlangıç listemize yeni video eklemek için ne yapacağız?**

Başlangıçtaki iki videoyu ve yeni videoyu içeren başka bir liste hazırlayacağız.

Önce yeni videomuz:

```
Video yeniVideo = new Video("Docker");
```

Ardından şu satır:

```
List<Video> extend = new ArrayList<>(videos);
```

Daha önce boş liste oluştururken:

```
new ArrayList<>()
```

yazmıştık.

Bu kez parantezin içine mevcut listeyi verdik:

```
new ArrayList<>(videos)
```

Bu constructor, mevcut listedeki elemanları içeren **yeni bir `ArrayList`** oluşturur. [docs.oracle.com](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/ArrayList.html?utm_source=chatgpt.com)

Satırın Türkçesi:

> “`videos` listesindeki mevcut elemanlarla başlayacak, değiştirilebilir bir çalışma listesi oluştur. Buna `extend` üzerinden ulaşayım.”

Bu noktada iki ayrı liste var:

| Değişken | Listedeki video adları      |
| -------- | --------------------------- |
| `videos` | Java temelleri, Spring Boot |
| `extend` | Java temelleri, Spring Boot |

**Yeni liste oluşturduk; mevcut video nesnelerini yeniden oluşturmadık.** Yeni listeye aynı video nesnelerinin referansları alındı.

Şimdi çalışma listesine yeni videoyu ekleyebiliriz:

```
extend.add(yeniVideo);
```

Son durum:

| Değişken | Listedeki video adları              |
| -------- | ----------------------------------- |
| `videos` | Java temelleri, Spring Boot         |
| `extend` | Java temelleri, Spring Boot, Docker |

Dikkat et: Ekleme işlemini **`extend` üzerinde** yaptık. Başlangıçtaki `videos` listesinin eleman yapısı değişmedi.

Şimdi çalışma listesinin elemanlarını içeren, değiştirilemeyen bir liste elde edelim:

```
List.copyOf(extend)
```

`List.copyOf(...)`, verilen koleksiyonun elemanlarını içeren değiştirilemeyen bir liste sağlar. Sonradan kaynak `extend` listesine eleman eklenmesi veya çıkarılması, bu sonucun eleman yapısını değiştirmez. [docs.oracle.com](https://docs.oracle.com/en/java/javase/25/docs/api/java.base/java/util/List.html?utm_source=chatgpt.com)

Bu sonucu güncel listemiz olarak kullanmak için:

```
videos = List.copyOf(extend);
```

yazıyoruz.

Burada **değişkenin tuttuğu referansı yeniden atadık**. `videos`, artık üç videoyu içeren listeye ulaşmamızı sağlıyor.

Bütün aşamaları yan yana görelim:

| Aşama                          | `videos` üzerinden ulaşılan liste | `extend` üzerinden ulaşılan liste |
| ------------------------------ | --------------------------------- | --------------------------------- |
| Başlangıç                      | Java, Spring                      | Henüz yok                         |
| `new ArrayList<>(videos)`      | Java, Spring                      | Java, Spring                      |
| `extend.add(yeniVideo)`        | Java, Spring                      | Java, Spring, Docker              |
| `videos = List.copyOf(extend)` | Java, Spring, Docker              | Java, Spring, Docker              |

**Eski listeye eleman eklemek ile değişkeni başka bir listeye yönlendirmek farklı işlemler.** Kodumuz ikinci işlemi yaptı.

Bunu çalıştırarak gözlemleyelim. `JavaDenemesi.java` içinde, kendi `package` satırının altına şu import’ları ekle:

```
import java.util.ArrayList;
import java.util.List;
```

Bunlar Java’nın hazır `ArrayList` ve `List` türlerini kısa isimleriyle kullanmamızı sağlar.

Ardından sınıfın içeriğini şöyle düzenle:

```
public class JavaDenemesi {

    public static void main(String[] args) {
        List<Video> videos = List.of(
            new Video("Java temelleri"),
            new Video("Spring Boot")
        );

        List<Video> eskiListe = videos;

        Video yeniVideo = new Video("Docker");

        List<Video> extend = new ArrayList<>(videos);
        extend.add(yeniVideo);
        videos = List.copyOf(extend);

        System.out.println(eskiListe.size());
        System.out.println(videos.size());
        System.out.println(videos.get(2).name());
    }
}
```

Beklenen çıktı:

```
2
3
Docker
```

Şu satırı özellikle okuyalım:

```
List<Video> eskiListe = videos;
```

Bu atamayla yeni liste oluşturmadık. Başlangıçtaki listeye ulaşan referansı `eskiListe` değişkenine de verdik.

Sonradan:

```
videos = List.copyOf(extend);
```

yazınca yalnızca `videos` değişkeninin tuttuğu referans değişti. `eskiListe` hâlâ başlangıçtaki iki elemanlı listeye ulaşıyor.

**Şimdi aynı işlemleri servisteki `create` metoduna yerleştirebiliriz:**

```
public Video create(Video newVideo) {
    List<Video> extend = new ArrayList<>(videos);
    extend.add(newVideo);
    this.videos = List.copyOf(extend);
    return newVideo;
}
```

Artık her satırın görevini okuyabiliyoruz:

1. **`new ArrayList<>(videos)`**  
   Servisin mevcut videolarını içeren, değiştirilebilir çalışma listesini oluşturur.

2. **`extend.add(newVideo)`**  
   Metoda verilen videoyu çalışma listesine ekler.

3. **`this.videos = List.copyOf(extend)`**  
   Güncel elemanları içeren değiştirilemeyen listeyi, servisin `videos` alanına atar.

4. **`return newVideo`**  
   Eklenen videonun referansını çağıran koda geri verir.

Buradaki `this.videos`, önceki derste öğrendiğimiz gibi **servis nesnesinin alanıdır**.

Serviste alanımız:

```
private List<Video> videos;
```

biçiminde tanımlı olduğu için yeniden atama yapabiliyoruz. Alanı `final` olarak tanımlasaydık `this.videos = ...` yeniden atamasına izin verilmezdi.

Ayrıca `return newVideo;` satırının görevi, videoyu listeye eklemek değildir. Ekleme ve güncel listeyi servise atama işlemleri önceki satırlarda gerçekleşmiştir. `return`, sonucu çağıran koda verir.

Şimdi küçük uygulaman: Yukarıdaki çalıştırılabilir örnekte, ilk güncellemeden sonra **`"PostgreSQL"` adlı bir video daha ekle**. Yine güncel `videos` listesinden çalışma listesi hazırlayıp güncelle.

Beklentimiz:

- `eskiListe.size()` → `2`
- `videos.size()` → `4`
- `videos.get(3).name()` → `PostgreSQL`

Ardından şu üç soruyu cevaplayalım:

1. `List<Video> extend = videos;` ile `List<Video> extend = new ArrayList<>(videos);` arasındaki fark nedir?
2. `extend.add(newVideo)` çalışınca başlangıçtaki liste neden değişmiyor?
3. `this.videos = List.copyOf(extend)` ile `return newVideo` hangi iki farklı işi yapıyor?

Sonraki çalışmada **Part 4’ün HTML formunu bu Java koduna bağlayacağız**: kullanıcının yazdığı adın `Video` nesnesine dönüşmesini, `create(...)` çağrısını ve yönlendirme sonrasında güncel listenin gösterilmesini birlikte izleyeceğiz.



----

----



Devam ediyoruz. 🙂 **Şimdi Part 4’ü yeniden kuruyoruz: Formdan gelen video adını alıp, öğrendiğimiz Java koduyla listeye ekleyeceğiz.**

Önce önceki üç soruyu açıklayalım:

1. **`extend = videos`**, aynı listeye ulaşan referansı kopyalar. **`new ArrayList<>(videos)`**, mevcut elemanları içeren ayrı bir liste oluşturur.
2. `extend.add(newVideo)` çalışma listesini değiştirir. Başlangıçtaki liste ayrı bir nesne olduğu için onun eleman yapısı değişmez.
3. **`this.videos = ...`**, servisin tuttuğu güncel listeyi belirler. **`return newVideo`**, eklenen videoyu çağıran koda sonuç olarak verir.

Bugünkü işlemimiz şu olacak:

> Kullanıcı forma **“Java dersim”** yazacak. Spring bu veriden bir `Video` oluşturacak. Controller videoyu servise verecek. Servis listeyi güncelleyecek. Tarayıcı ana sayfayı tekrar istediğinde yeni videoyu göreceğiz.

Bunu parçalarıyla kuracağız.

**Önce formun ne gönderdiğini anlayalım.**

Ana sayfamıza şu formu ekliyoruz:

```
<form action="/new-video" method="post">
    <input type="text" name="name">
    <button type="submit">Ekle</button>
</form>
```

| Parça                 | Görevi                                 |
| --------------------- | -------------------------------------- |
| `action="/new-video"` | Verinin gönderileceği adres            |
| `method="post"`       | Kullanılacak HTTP metodu               |
| `type="text"`         | Metin yazılabilen kutu                 |
| `name="name"`         | Yazılan değerin gönderileceği alan adı |
| `type="submit"`       | Düğmeye basılınca formu gönderir       |

Kullanıcı kutuya:

```
Java dersim
```

yazıp **Ekle** düğmesine bastığında tarayıcı, `/new-video` adresine bir **POST isteği** gönderir.

İsteğin ilgili bölümlerini sadeleştirelim:

```
POST /new-video
Content-Type: application/x-www-form-urlencoded

name=Java+dersim
```

Son satır şunu taşıyor:

| Alan adı | Değer       |
| -------- | ----------- |
| `name`   | Java dersim |

Buradaki `+`, form verisinin kodlanmış gösteriminde boşluğu temsil ediyor. Spring’in okuyacağı metin değeri `"Java dersim"` olacak.

**Şimdi formdaki `name` ile Java’daki `name` arasındaki bağlantıyı kuralım.**

Video türümüz:

```
public record Video(String name) {}
```

Form alanımız:

```
<input type="text" name="name">
```

Form **`name` alanını** gönderiyor. `Video` da **`name` bileşenini** taşıyor.

Bu eşleşmeyi kullanacak controller metodumuz:

```
@PostMapping("/new-video")
public String newVideo(@ModelAttribute Video newVideo) {
    videoService.create(newVideo);
    return "redirect:/";
}
```

Önce metoda ulaşma kısmını okuyalım:

```
@PostMapping("/new-video")
```

> “`/new-video` adresine gelen POST isteğinde bu metodu çalıştır.”

Burada iki bilgi birlikte belirleyici:

- HTTP metodu: **POST**
- Adres: **`/new-video`**

Şimdi parametreye bakalım:

```
@ModelAttribute Video newVideo
```

Java tarafını artık tanıyoruz:

```
Video newVideo
```

Bu, `Video` türünde bir parametre.

Spring tarafındaki:

```
@ModelAttribute
```

ise gelen istek alanlarının bu nesneye bağlanmasını sağlıyor. Mevcut örneğimizde Spring, formdaki `name` değerini record’un constructor’ına sağlayarak bir `Video` oluşturabiliyor. [docs.spring.io](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html?utm_source=chatgpt.com)

Sonuç bakımından şu nesnenin oluşturulduğunu düşünebilirsin:

```
new Video("Java dersim")
```

**Controller metodunun gövdesi çalışmaya başladığında `newVideo` parametresi üzerinden bu nesneye ulaşabiliyoruz.**

Dolayısıyla:

```
newVideo.name()
```

sonucu:

```
Java dersim
```

olur.

Burada isimleri bir kez daha ayıralım:

| İsim                       | Görevi                                      |
| -------------------------- | ------------------------------------------- |
| Formdaki `"name"`          | Gönderilen alanın anahtarı                  |
| Record’daki `name`         | Videonun taşıdığı veri                      |
| Controller’daki `newVideo` | Gelen nesneye ulaşacağımız parametrenin adı |

Controller parametresinin adını `gelenVideo` yapabiliriz. Bu form eşleşmesini değiştirmez:

```
@PostMapping("/new-video")
public String newVideo(@ModelAttribute Video gelenVideo) {
    videoService.create(gelenVideo);
    return "redirect:/";
}
```

Form alanının eşleştiği bilgi, **`Video` record’undaki `name`** bileşenidir.

**Şimdi controller’ın videoyu servise vermesini okuyalım.**

```
videoService.create(newVideo);
```

Bu, önceki çalışmalarımızdaki gibi normal bir Java metot çağrısıdır:

> “Controller’ın tuttuğu servis nesnesinin `create` metodunu çalıştır. Bu videoyu ona ver.”

Servis metodumuz:

```
public Video create(Video newVideo) {
    List<Video> extend = new ArrayList<>(videos);
    extend.add(newVideo);
    this.videos = List.copyOf(extend);
    return newVideo;
}
```

Bu çağrıda:

1. Mevcut videolar çalışma listesine alınır.
2. `"Java dersim"` adlı video çalışma listesine eklenir.
3. Güncel liste servisin `videos` alanına atanır.
4. Eklenen video controller’a geri verilir.

Controller burada servisten dönen videoyu bir değişkene atamıyor. Servisin listeyi güncellemesini sağladıktan sonra kendi sonraki satırına geçiyor:

```
return "redirect:/";
```

İki metodun dönüş türlerinin farklı olabildiğini gör:

| Metot                          | Döndürdüğü sonuç |
| ------------------------------ | ---------------- |
| `VideoService.create(...)`     | `Video`          |
| `HomeController.newVideo(...)` | `String`         |

Servis videoyu sonuç olarak verir. Controller ise bu form işleminin ardından uygulanacak yönlendirmeyi belirtir.

**Şimdi `return "redirect:/";` satırını açalım.**

Java açısından bu satır, metodun sonucu olarak bir `String` döndürür.

Spring MVC, `@Controller` içindeki bu sonucu yorumladığında:

```
"redirect:/"
```

değerini **`/` adresine yönlendirme talimatı** olarak kullanır.

Mevcut varsayılan akışta tarayıcıya şu cevabın ilgili bilgileri gönderilir:

```
HTTP/1.1 302 Found
Location: /
```

`Location`, yönlendirilecek adresi gösterir. Varsayılan `RedirectView` davranışı burada `302` kullanır. [docs.spring.io](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/web/servlet/view/RedirectView.html?utm_source=chatgpt.com)

Tarayıcı yönlendirmeyi izler ve yeni bir istek gönderir:

```
GET /
```

Bu yeni istek, ana sayfa metodumuzu çalıştırır:

```
@GetMapping("/")
public String index(Model model) {
    model.addAttribute("videos", videoService.getVideos());
    return "index";
}
```

Bu metotta üç iş var:

1. `videoService.getVideos()` ile **güncel listeyi** alıyoruz.
2. Listeyi modele `"videos"` adıyla ekliyoruz.
3. `"index"` görünümünün hazırlanmasını istiyoruz.

`Model`, şablona ulaştıracağımız verileri taşıyan yapıdır.

Şu satır:

```
model.addAttribute("videos", videoService.getVideos());
```

> “Güncel video listesini, şablonun `videos` adıyla kullanabileceği şekilde modele koy.”

anlamına gelir.

İki `String` sonucunu karşılaştıralım:

| Controller’ın sonucu | Spring MVC’nin yaptığı                                        |
| -------------------- | ------------------------------------------------------------- |
| `"index"`            | Modeli kullanarak `index.mustache` şablonundan sayfa hazırlar |
| `"redirect:/"`       | Tarayıcıya `/` adresine yönlendirme cevabı gönderir           |

Yönlendirmeden sonra gelen **yeni GET isteği**, güncellenmiş verinin sayfada gösterilmesini sağlıyor.

Bu akışın adı **Post/Redirect/Get**:

- **POST:** Form verisini gönder, videoyu ekle.
- **Redirect:** Sonuç sayfasına yönlendir.
- **GET:** Güncel sayfayı getir.

Normal akışta sonuç sayfasını yenilediğinde son GET isteği tekrarlanır. Bu yüzden sayfa yenilemek, video ekleme POST’unu tekrar göndermez.

Bütün yolu tek yerde görelim:







![mermaid-diagram.png](/Users/firatatalay/Downloads/mermaid-diagram.png)





Burada tarayıcının **iki HTTP isteği** var: POST ve ardından GET. Controller ile servis arasındaki işlemler ise uygulama içindeki Java metot çağrıları.

**Şimdi kodları dosyalarında birleştirelim.** Java dosyalarının en üstündeki mevcut `package` satırını koru; `Video`, `VideoService` ve `HomeController` aynı pakette olsun.

`VideoService.java` şu yapıda olmalı:

```
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

@Service
public class VideoService {

    private List<Video> videos = List.of(
        new Video("Need HELP with your SPRING BOOT 4 App?"),
        new Video("Don't do THIS to your own CODE!"),
        new Video("SECRETS to fix BROKEN CODE!")
    );

    public List<Video> getVideos() {
        return videos;
    }

    public Video create(Video newVideo) {
        List<Video> extend = new ArrayList<>(videos);
        extend.add(newVideo);
        this.videos = List.copyOf(extend);
        return newVideo;
    }
}
```

`HomeController.java` içinde iki isteği karşılıyoruz:

```
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.ModelAttribute;
import org.springframework.web.bind.annotation.PostMapping;

@Controller
public class HomeController {

    private final VideoService videoService;

    public HomeController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping("/")
    public String index(Model model) {
        model.addAttribute("videos", videoService.getVideos());
        return "index";
    }

    @PostMapping("/new-video")
    public String newVideo(@ModelAttribute Video newVideo) {
        videoService.create(newVideo);
        return "redirect:/";
    }
}
```

Şablonumuz **`src/main/resources/templates/index.mustache`** içinde olsun:

```
<!doctype html>
<html lang="tr">
<head>
    <meta charset="UTF-8">
    <title>Video listesi</title>
</head>
<body>
    <h1>Videolar</h1>

    <ul>
        {{#videos}}
        <li>{{name}}</li>
        {{/videos}}
    </ul>

    <form action="/new-video" method="post">
        <input type="text" name="name">
        <button type="submit">Ekle</button>
    </form>
</body>
</html>
```

Şablondaki:

- `{{#videos}}` ve `{{/videos}}`, modele koyduğumuz listedeki elemanları işler.
- `{{name}}`, o sırada işlenen videonun adını gösterir.

**Şimdi uygulayalım:**

1. `@SpringBootApplication` bulunan ana uygulama sınıfından uygulamayı başlat.
2. [http://localhost:8080/](http://localhost:8080/) adresini aç.
3. Forma `"Java dersim"` yazıp **Ekle** düğmesine bas.
4. Başlangıçtaki üç videonun yanında yeni videoyu görmeyi bekle.
5. Sayfayı iki kez yenile. Listenin dört videoda kalmasını gözlemle.

Tarayıcının **Network** panelinde **Preserve log / Günlüğü koru** seçeneğini açarak ana istekleri izleyebilirsin:

| İstek                      | Beklenen cevap        |
| -------------------------- | --------------------- |
| `POST /new-video`          | `302` yönlendirmesi   |
| Ardından `GET /`           | `200` ve güncel sayfa |
| Sonraki sayfa yenilemeleri | `GET /`               |

Verimiz hâlâ servis nesnesinin içinde, uygulamanın belleğinde tutuluyor. Uygulamayı yeniden başlattığında başlangıçtaki üç video yeniden oluşturulur.

Üç kontrol sorumuz:

1. Formdaki `name="name"`, controller parametresinin adıyla mı, `Video` record’unun bileşeniyle mi eşleşiyor?
2. `create(...)` bir `Video` döndürürken controller metodumuz neden bir `String` döndürebiliyor?
3. `return "redirect:/";` sonrasında yeni videoyu sayfaya yerleştiren GET metodunda hangi satır güncel listeyi alıyor?

Kodunu çalıştırdıktan sonra özellikle **formdan veri alma ve yönlendirme** kısmını birlikte kontrol edeceğiz. Ardından Part 5’te aynı servis işlemini JSON üzerinden kullanacağız.





----

---

**Burada en önemli ayrım şu: Birinde elinde bir `Video` nesnesi var; diğerinde sayfanın kullanacağı verileri tutan bir yapı var.**

| İfade                            | Bizim örneğimizde görevi                                     |
| -------------------------------- | ------------------------------------------------------------ |
| `@ModelAttribute Video newVideo` | Formdan gelen bilgilerle hazırlanmış videoya ulaşmak         |
| `Model model`                    | HTML sayfasında gösterilecek verileri isimleriyle hazırlamak |

Önce Java kısmını ayıralım:

| Yazım            | Tür     | Parametreye verdiğimiz isim |
| ---------------- | ------- | --------------------------- |
| `Video newVideo` | `Video` | `newVideo`                  |
| `Model model`    | `Model` | `model`                     |

`Video` türünü biz tanımladık. `Model` ise Spring’in hazır sunduğu bir arayüzdür. `newVideo` ve `model`, bizim seçtiğimiz parametre isimleridir.

**Şimdi ilkini tek bir form gönderimi üzerinden anlayalım.**

Video tanımımız:

```
record Video(String name) {}
```

Form alanımız:

```
<input type="text" name="name">
```

Kullanıcı kutuya:

```
Java dersim
```

yazıyor.

Tarayıcı, sunucuya şu alanı gönderiyor:

```
name=Java dersim
```

Controller parametremiz:

```
@ModelAttribute Video newVideo
```

Spring bu parametreyi hazırlarken:

1. Formdaki `name` alanını okuyor.
2. Bunu `Video` record’undaki `name` bilgisiyle eşleştiriyor.
3. Bu değerle bir `Video` nesnesi oluşturuyor.
4. Metodumuzu çağırırken nesnenin referansını `newVideo` parametresine veriyor. Constructor üzerinden bu bağlama Spring tarafından destekleniyor. [docs.spring.io](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html?utm_source=chatgpt.com)

Spring’in hazırladığı nesnenin öğrenme amaçlı Java gösterimi şöyle:

```
new Video("Java dersim")
```

**Metodumuz çalışmaya başladığında `newVideo` zaten hazırlanmış durumda.**

Bu yüzden metot içinde:

```
newVideo.name()
```

yazınca:

```
Java dersim
```

değerini okuyoruz.

Ardından:

```
videoService.create(newVideo);
```

ile bu videoyu servise verebiliyoruz.

Burada `@ModelAttribute` şu talimatı veriyor:

> “Gelen form alanlarını bu `Video` nesnesine bağla.”

Parametrenin adını değiştirsek de aynı işlem gerçekleşir:

```
@ModelAttribute Video gelenVideo
```

Bu durumda nesnenin adını:

```
gelenVideo.name()
```

ile okuruz. Formdaki `"name"`, record’daki `name` bilgisiyle eşleşir.

**Şimdi `Model model` kısmına geçelim.**

Bir HTML sayfasında şu başlığı göstermek istediğimizi düşün:

```
Videolarım
```

Controller’da:

```
model.addAttribute("baslik", "Videolarım");
```

yazıyoruz.

Bu satırın anlamı:

> “Sayfanın kullanacağı verilere `baslik` adıyla `Videolarım` değerini ekle.”

`model` içinde artık şöyle bir isim/değer eşleşmesi bulunur:

| İsim     | Değer      |
| -------- | ---------- |
| `baslik` | Videolarım |

**`Model`, bu isim/değer eşleşmelerini tutan veri taşıyıcısıdır.** `addAttribute(...)`, verdiğimiz değeri belirttiğimiz isimle bu yapıya ekler. [docs.spring.io](https://docs.spring.io/spring-framework/docs/current/javadoc-api/org/springframework/ui/Model.html?utm_source=chatgpt.com)

Mustache dosyasında:

```
<h1>{{baslik}}</h1>
```

yazdığımızda şablon, modeldeki `baslik` değerini kullanır. Hazırlanan HTML:

```
<h1>Videolarım</h1>
```

olur.

Şimdi bizim gerçek kodumuzdaki satırı okuyabiliriz:

```
model.addAttribute("videos", videoService.getVideos());
```

Bunu iki küçük adıma açalım:

```
List<Video> liste = videoService.getVideos();

model.addAttribute("videos", liste);
```

İlk satır, servisten video listesini alır.

İkinci satır, bu listeyi **`"videos"` adıyla sayfanın kullanacağı verilere ekler.**

Modelin içinde hem başlık hem liste bulunabilir:

| İsim     | Değer                             |
| -------- | --------------------------------- |
| `baslik` | `"Videolarım"` metni              |
| `videos` | Servisten aldığımız video listesi |

Şablon bunları isimleriyle kullanır:

```
<h1>{{baslik}}</h1>

<ul>
    {{#videos}}
    <li>{{name}}</li>
    {{/videos}}
</ul>
```

**Peki `Model model` parametresini kim hazırlıyor?**

Spring, controller metodumuzu çağırırken kullanabileceğimiz model yapısını bize sağlar. Biz de `model` parametresi üzerinden bu yapıya veri ekleriz. Modeldeki veriler, görünüm hazırlanırken şablona sunulur. [docs.spring.io](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/arguments.html?utm_source=chatgpt.com)

Örneğin:

```
@GetMapping("/")
public String index(Model model) {
    model.addAttribute("baslik", "Videolarım");
    model.addAttribute("videos", videoService.getVideos());

    return "index";
}
```

Bu metodun görevi:

> “Sayfada gösterilecek başlığı ve video listesini hazırla; ardından `index.mustache` şablonuyla sayfayı oluştur.”

Parametrenin adını burada da değiştirebiliriz:

```
@GetMapping("/")
public String index(Model sayfaVerileri) {
    sayfaVerileri.addAttribute("baslik", "Videolarım");
    sayfaVerileri.addAttribute("videos", videoService.getVideos());

    return "index";
}
```

Aynı işi yapar. Çünkü **`Model` türdür; `sayfaVerileri` bizim seçtiğimiz isimdir.**

İsimlerinin benzerliğinin de bir nedeni var: `@ModelAttribute` ile hazırlanan `Video`, modelin içine bir veri olarak da eklenir. Yani bu kavramlar ilişkilidir: **`newVideo` belirli bir video nesnesine, `model` ise isimlendirilmiş verileri tutan bütün yapıya ulaşmamızı sağlar.** [docs.spring.io](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/modelattrib-method-args.html?utm_source=chatgpt.com)

Şimdi yalnızca şu iki küçük örneği yorumlayalım:

1. Kullanıcı forma **`Docker dersim`** yazdı. Metot başladığında `newVideo.name()` hangi değeri verir?

2. Şunu yazdık:

   ```
   model.addAttribute("mesaj", "Hoş geldin");
   ```

   Mustache dosyasında `Hoş geldin` metnini göstermek için `{{...}}` içine hangi ismi yazmalıyız?

   ---

   ---

   



Devam edelim. Part 4’te formdan video ekleyip HTML sayfasına dönüyorduk. **Part 5’te aynı `VideoService` üzerinden JSON veri alıp göndereceğiz.**

Bunu somut bir örnekle kuralım.

Java’da bir video nesnesini şöyle oluşturuyorduk:

```
Video video = new Video("Java dersim");
```

Bu videonun JSON olarak gösterimi ise şöyle:

```
{
  "name": "Java dersim"
}
```

JSON, veri taşımak için kullanılan bir metin biçimi. Burada `"name"` alanın adı, `"Java dersim"` o alanın değeri.

**Java nesnesi ile JSON metni farklı şeylerdir.** Spring, isteği alırken ve cevabı gönderirken aralarındaki dönüşümü yapabilir.

Şimdi `Video` ve `VideoService` ile aynı pakette `ApiController.java` oluştur. Dosyanın başında kendi projenin `package` satırı bulunsun:

```
import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class ApiController {

    private final VideoService videoService;

    public ApiController(VideoService videoService) {
        this.videoService = videoService;
    }

    @GetMapping("/api/videos")
    public List<Video> all() {
        return videoService.getVideos();
    }

    @PostMapping("/api/videos")
    public Video newVideo(@RequestBody Video newVideo) {
        return videoService.create(newVideo);
    }
}
```

Kodun tamamını bir anda anlamaya çalışma. Önce bildiğimiz kısmı ayıralım:

```
private final VideoService videoService;

public ApiController(VideoService videoService) {
    this.videoService = videoService;
}
```

Burada controller’ın kullanacağı servis bir alanda tutuluyor. Spring, constructor’ı çağırırken `VideoService` nesnesini veriyor. Bu, `HomeController` içinde kullandığımız yapının aynısı.

Yeni davranışı şu annotation belirliyor:

```
@RestController
```

Bu controller’ın metotlarından dönen değerler HTTP cevabının gövdesine yazılır. Bizim örneğimizde `Video` ve `List<Video>` değerleri JSON’a dönüştürülür. [docs.spring.io](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/responsebody.html?utm_source=chatgpt.com)

Eski controller’da:

```
return "index";
```

diyerek bir HTML şablonunun adını veriyorduk.

Yeni controller’da:

```
return videoService.getVideos();
```

diyerek **videoların kendisini** döndürüyoruz.

Bu yüzden bu metotta `Model model` parametresine ihtiyacımız yok. Veriyi bir HTML şablonuna yerleştirmiyoruz; doğrudan cevap olarak gönderiyoruz.

Şimdi listeleme metodunu okuyalım:

```
@GetMapping("/api/videos")
public List<Video> all() {
    return videoService.getVideos();
}
```

Parçaların anlamları şöyle:

| Kod                          | Anlamı                                          |
| ---------------------------- | ----------------------------------------------- |
| `@GetMapping("/api/videos")` | Bu adrese gelen GET isteğini bu metot karşılar. |
| `List<Video>`                | Metodun Java dönüş tipi: video listesi.         |
| `all`                        | Metodun bizim seçtiğimiz adı.                   |
| `videoService.getVideos()`   | Servisten mevcut listeyi alır.                  |
| `return`                     | Listeyi metodu çağıran Spring’e verir.          |

Uygulamayı başlattıktan sonra tarayıcıdan şu adresi açabilirsin:

```
http://localhost:8080/api/videos
```

Tarayıcı bu adrese GET isteği gönderir. Ardından:

1. Spring, `all()` metodunu çağırır.
2. Metot, servisten video listesini alır.
3. Metot bu Java listesini döndürür.
4. Spring listeyi JSON’a çevirip tarayıcıya gönderir.

Örneğin serviste iki video varsa cevap şöyle görünür:

```
[
  {
    "name": "Java dersim"
  },
  {
    "name": "Spring dersim"
  }
]
```

Dışarıdaki `[...]`, bir listeyi gösteriyor. İçerideki her `{...}`, bir videoyu gösteriyor.

Buradaki önemli ayrım: **`all()` Java’da `List<Video>` döndürüyor. Tarayıcıya giden cevap ise bu listenin JSON gösterimi.**

Şimdi video ekleyen metodu inceleyelim:

```
@PostMapping("/api/videos")
public Video newVideo(@RequestBody Video newVideo) {
    return videoService.create(newVideo);
}
```

Aynı adresi kullanıyoruz ama istek türü farklı:

| İstek              | Yapılan işlem            |
| ------------------ | ------------------------ |
| `GET /api/videos`  | Videoları listele.       |
| `POST /api/videos` | Gönderilen videoyu ekle. |

Spring hangi metodu çağıracağını belirlerken hem adresi hem istek türünü dikkate alır.

POST isteğinin gövdesinde şu JSON’un bulunduğunu düşün:

```
{
  "name": "Docker dersim"
}
```

Şu parametreye odaklanalım:

```
@RequestBody Video newVideo
```

Bunu şöyle okuyabilirsin:

> “İsteğin gövdesindeki veriyi oku, `Video` nesnesine dönüştür ve bu nesneyi `newVideo` parametresine ver.”

Bu dönüşüm metot çalışmaya **başlamadan önce** yapılır. `@RequestBody`, isteğin gövdesini uygun dönüştürücü üzerinden Java nesnesine bağlar. [docs.spring.io](https://docs.spring.io/spring-framework/reference/web/webmvc/mvc-controller/ann-methods/requestbody.html?utm_source=chatgpt.com)

Yani metodun içine girdiğimizde:

```
newVideo.name()
```

şunun değerini verir:

```
Docker dersim
```

**Metodun içindeki `newVideo` artık bir `Video` nesnesidir.**

JSON’daki `"name"` alanı, record’umuzdaki `name` bileşenine karşılık gelir:

```
public record Video(String name) {
}
```

Parametrenin adı olan `newVideo` ile eşleşmez. Parametreye `gelenVideo` deseydik de gönderdiğimiz JSON yine `"name"` alanını kullanırdı.

Son satır:

```
return videoService.create(newVideo);
```

Aslında şu iki satırın kısa yazımı:

```
Video eklenenVideo = videoService.create(newVideo);

return eklenenVideo;
```

Önce servis videoyu listeye ekler ve eklediği nesneyi geri verir. Controller da bu nesneyi döndürür. Spring onu JSON’a çevirerek istemciye gönderir.

Böylece bütün işlem şöyle ilerler:

1. İstemci `{"name":"Docker dersim"}` gönderir.
2. Spring bu veriden bir `Video` nesnesi oluşturur.
3. Spring, nesneyi vererek controller metodunu çağırır.
4. Controller, `videoService.create(newVideo)` çağrısını yapar.
5. Servis videoyu listeye ekler.
6. Controller eklenen `Video` nesnesini döndürür.
7. Spring cevap olarak `{"name":"Docker dersim"}` gönderir.

Part 4 ile bağlantısı da tam burada:

```
// Part 4: Formdan gelen nesneyi ekle.
videoService.create(newVideo);

// Ardından tarayıcıyı ana sayfaya yönlendir.
return "redirect:/";
```

```
// Part 5: JSON'dan gelen nesneyi ekle.
// Eklenen nesneyi cevap olarak döndür.
return videoService.create(newVideo);
```

**Servisteki ekleme işlemi aynı. Controller’ın verdiği cevap değişiyor.**

Şimdi bunu denemek için önce tarayıcıdan `/api/videos` adresini aç. POST isteği göndermek için ise adres çubuğu yeterli olmaz; gövdesinde JSON bulunan bir istek göndermeliyiz.

Bash/Zsh terminalinde şu komutu kullanabilirsin:

```
curl -i -X POST http://localhost:8080/api/videos -H 'Content-Type: application/json' -d '{"name":"Docker dersim"}'
```

Burada:

- `-X POST`: POST isteği gönderir.
- `-H 'Content-Type: application/json'`: Gönderilen verinin JSON olduğunu belirtir.
- `-d`: İsteğin gövdesine koyacağımız veriyi verir.
- `-i`: Cevabın başlıklarını da gösterir.

Bu kodla, başarılı isteğin cevap gövdesinde şunu görmeyi bekleriz:

```
{"name":"Docker dersim"}
```

Ardından `/api/videos` adresini yenilediğinde yeni video listede görünmeli. `/` adresindeki HTML sayfasını yenilediğinde de görünmeli; iki controller aynı `VideoService` nesnesini kullanıyor. Liste şu an bellekte tutulduğu için uygulamayı yeniden başlatınca başlangıç verilerine döner.

Önce şu tek noktayı oturtalım: **POST metodunun içine girdiğimiz anda `newVideo`, JSON metni mi yoksa Java’daki bir `Video` nesnesi mi?**
