# İlk konteyner

Bir PostgreSQL veritabanını kurulum yapmadan çalıştıralım:

```bash
docker run --name not-db \
  -e POSTGRES_PASSWORD=gizli-degil-ornek \
  -p 5432:5432 \
  -d postgres:17
```

| Parametre | Anlamı |
| --- | --- |
| `--name` | Konteynere okunabilir bir ad verir. |
| `-e` | Ortam değişkeni tanımlar. |
| `-p` | Bilgisayardaki portu konteynerdeki porta bağlar. |
| `-d` | Konteyneri arka planda çalıştırır. |

Önceki part: [Docker nedir?](part-1.md) · Sonraki chapter: [Dockerfile](../chapter-2/part-1.md)
