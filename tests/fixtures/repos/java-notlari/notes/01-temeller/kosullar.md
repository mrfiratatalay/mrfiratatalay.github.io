# Koşullar

Program akışını bir koşula göre değiştirmek için `if`, `else` ve `switch` kullanırız.

## if-else

```java
int puan = 82;

if (puan >= 85) {
    System.out.println("Pekiyi");
} else if (puan >= 70) {
    System.out.println("İyi");
} else {
    System.out.println("Geliştirilmeli");
}
```

## switch ifadesi

Java 14 ile gelen `switch` ifadesi değer döndürebilir:

```java
String gun = "CUMARTESI";
boolean haftaSonu = switch (gun) {
    case "CUMARTESI", "PAZAR" -> true;
    default -> false;
};
```

> Bir önceki notta tipleri görmüştük: [Referans tipler](./degiskenler.md#referans-tipler) ve [İlkel tipler](./degiskenler.md#ilkel-tipler)

Bu notta olmayan bir başlığa verilen bağlantı rapora uyarı olarak düşer: [olmayan başlık](#boyle-bir-baslik-yok).
