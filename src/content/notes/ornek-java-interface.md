---
title: "Örnek not: Java'da interface"
urlSlug: ornek-java-interface
description: Interface'in bir davranış sözleşmesi olduğunu kısa bir örnekle anlatan örnek not.
category: java
publishedAt: 2026-10-06
tags:
  - java
  - örnek
published: true
---

> Bu bir **örnek nottur**. Pages CMS'deki **Öğrenme Notları** bölümünden düzenleyebilir veya silebilirsin. Yeni bir öğrenme konusu için yeni bir repo açman gerekmez; notu buradan eklemen yeterli.

## Interface ne söyler?

Interface, bir sınıfın **ne yapabileceğini** tanımlar; **nasıl yapacağını** sınıfın kendisine bırakır.

```java
public interface Bildirim {
    void gonder(String alici, String mesaj);
}
```

## Uygulayan sınıflar

```java
public class EpostaBildirimi implements Bildirim {
    @Override
    public void gonder(String alici, String mesaj) {
        System.out.println(alici + " adresine e-posta: " + mesaj);
    }
}

public class SmsBildirimi implements Bildirim {
    @Override
    public void gonder(String alici, String mesaj) {
        System.out.println(alici + " numarasına SMS: " + mesaj);
    }
}
```

## Neden işe yarar?

Kodun geri kalanı yalnızca `Bildirim` tipini bilir. Yeni bir bildirim türü eklemek için mevcut kodu değiştirmek yerine yeni bir sınıf yazmak yeterlidir. Spring'deki bağımlılık enjeksiyonu da bu fikirden güç alır.
