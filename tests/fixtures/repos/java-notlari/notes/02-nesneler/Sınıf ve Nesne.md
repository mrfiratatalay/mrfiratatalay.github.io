# Sınıf ve nesne

Sınıf bir **şablondur**; nesne ise bu şablondan üretilmiş somut bir örnektir.

![Sınıf ve nesne ilişkisini gösteren diyagram](<görseller/sınıf diyagramı.png>)

```java
public class Kitap {
    private final String ad;
    private final int sayfa;

    public Kitap(String ad, int sayfa) {
        this.ad = ad;
        this.sayfa = sayfa;
    }

    public String ozet() {
        return ad + " (" + sayfa + " sayfa)";
    }
}

Kitap kitap = new Kitap("Spring Boot'a Giriş", 320);
System.out.println(kitap.ozet());
```

Aynı görsele yüzde kodlamasıyla da bağlantı verilebilir: [diyagramı aç](g%C3%B6rseller/s%C4%B1n%C4%B1f%20diyagram%C4%B1.png).

Konunun devamı için [Interface notuna](interface.md) bakabilirsin.
