---
title: FraudCell
urlSlug: fraudcell
tagline:
  tr: Olay güdümlü dolandırıcılık operasyon platformu
  en: Event-Driven Fraud Operations Platform
context:
  tr: Turkcell Code Night 2026 All-Star Finali
  en: Turkcell Code Night 2026 All-Star Final
summary:
  tr: YARP API Gateway arkasında Identity, Transaction, AI ve Gamification servislerinden oluşan, RabbitMQ ile asenkron haberleşen konteynerleştirilmiş bir dolandırıcılık operasyon platformu.
  en: A containerized fraud operations platform with Identity, Transaction, AI and Gamification services behind a YARP API Gateway, communicating asynchronously over RabbitMQ.
highlights:
  tr:
    - YARP API Gateway arkasında Identity, Transaction, AI ve Gamification servislerinden oluşan, her servisin ayrı bir PostgreSQL veritabanı kullandığı ve RabbitMQ ile asenkron haberleştiği konteynerleştirilmiş platformu ekip arkadaşlarımla birlikte geliştirdim.
    - Transactional outbox/inbox desenleriyle olay güdümlü işlem değerlendirmesini, rol bazlı yetkilendirmeyi, gerçek zamanlı bildirimleri ve AI servisi erişilemez olduğunda işlem kabulünü çalışır durumda tutan yedek (fallback) akışını uyguladım.
  en:
    - Co-developed a containerized fraud operations platform comprising Identity, Transaction, AI and Gamification services behind a YARP API Gateway, with a separate PostgreSQL database for each service and RabbitMQ-based asynchronous communication.
    - Implemented event-driven transaction assessment using transactional outbox/inbox patterns, role-based authorization, real-time notifications and fallback handling that kept transaction intake operational when the AI service was unavailable.
technologies:
  - ASP.NET Core 10
  - YARP
  - FastAPI
  - scikit-learn
  - RabbitMQ
  - PostgreSQL
  - React
  - Docker
icon: shield
color: red
repoUrl: https://github.com/mrfiratatalay/FraudCell
featured: false
order: 1
published: true
---
