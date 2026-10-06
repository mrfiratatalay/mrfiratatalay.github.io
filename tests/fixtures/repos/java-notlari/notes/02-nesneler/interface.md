---
title: "Interface: davranış sözleşmesi"
date: 2026-09-14
tags:
  - java
  - oop
---

# Interface: davranış sözleşmesi

Interface, bir sınıfın **ne yapabileceğini** söyler ama **nasıl yapacağını** söylemez.

```java
public interface Odeme {
    void ode(long kurus);
}

public class KartlaOdeme implements Odeme {
    @Override
    public void ode(long kurus) {
        System.out.println(kurus / 100.0 + " TL karttan çekildi.");
    }
}
```

Bir önceki konu: [Sınıf ve nesne](<./Sınıf ve Nesne.md>). Bütün notların listesi için [not klasörüne](../) dönebilirsin.

Henüz yayınlanmamış bir nota verilen bağlantı GitHub'daki kaynak dosyaya yönlendirilir: [yarım not](../taslaklar/yarim-not.md).

Kaynakta bulunmayan bir görsel sitede kırık görsel yerine anlaşılır bir not olarak görünür:

![Eksik çizim](./olmayan-gorsel.png)
