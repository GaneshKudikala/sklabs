---
title: Wat een cloud landing zone is, en waarom je daarmee begint
description: Een landing zone is het beheerste fundament van een cloudomgeving. Dit zit erin en zo wordt starten zonder landing zone duur.
date: 2026-11-09
tags: [cloud, aws, terraform]
draft: true
---

_Voorbeeldartikel. Vervang of verwijder dit vóór de lancering._

Een landing zone is het voorgeconfigureerde, beheerste fundament waarop alle workloads in je cloudomgeving draaien. Het beantwoordt de vragen die later lastig te veranderen zijn: hoe accounts zijn ingedeeld, hoe mensen inloggen, hoe netwerken verbonden zijn en welke regels overal gelden.

## Wat er meestal in zit

- **Accountstructuur.** Aparte accounts of subscriptions voor productie, niet-productie, securitytooling en gedeelde diensten.
- **Identiteit en toegang.** Centrale single sign-on, least-privilege rollen en geen langlevende credentials.
- **Netwerk.** Een geplande adresruimte, gedeelde connectiviteit en duidelijke grenzen tussen omgevingen.
- **Guardrails.** Beleid dat risicovolle configuraties blokkeert, zoals publieke opslag of uitgeschakelde logging, voordat ze live gaan.
- **Logging en monitoring.** Auditlogs op één plek die workloads niet kunnen aanpassen.
- **Kostenzicht.** Tagging en budgetten zodat uitgaven naar een team of product herleid kunnen worden.

## Waarom hier beginnen

Teams die met één account beginnen voegen structuur vaak toe onder druk, zodra er productieworkloads, auditors en een groeiende rekening zijn. Later verplaatsen betekent netwerken en rechten herbouwen terwijl mensen ervan afhankelijk zijn.

## Behandel het als code

Leg de landing zone vast als infrastructure as code, zoals Terraform, en review wijzigingen zoals elke andere software. Zo is het fundament reproduceerbaar, controleerbaar en eenvoudig over te dragen.

Plan je een migratie of een nieuw platform? Dan is een korte assessment van je huidige situatie vaak de goedkoopste manier om te bepalen hoe het fundament eruit moet zien.
