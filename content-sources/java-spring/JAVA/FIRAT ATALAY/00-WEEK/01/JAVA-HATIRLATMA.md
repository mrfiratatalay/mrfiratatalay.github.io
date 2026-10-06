

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
