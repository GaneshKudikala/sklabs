---
title: What a cloud landing zone is, and why it comes first
description: A landing zone is the governed foundation of a cloud estate. Here is what it contains and why starting without one gets expensive.
date: 2026-11-09
tags: [cloud, aws, terraform]
---

_Sample article. Replace or delete it before launch._

A landing zone is the pre-configured, governed foundation that every workload in your cloud environment is built on. It answers the questions that are painful to change later: how accounts are organised, how people sign in, how networks connect, and which rules apply everywhere.

## What it usually contains

- **Account structure.** Separate accounts or subscriptions for production, non-production, security tooling and shared services.
- **Identity and access.** Central single sign-on, least-privilege roles and no long-lived credentials.
- **Networking.** A planned address space, shared connectivity and clear boundaries between environments.
- **Guardrails.** Policies that block risky configurations, such as public storage or disabled logging, before they ship.
- **Logging and monitoring.** Audit logs collected in one place that workloads cannot tamper with.
- **Cost visibility.** Tagging and budgets so spend can be traced to a team or product.

## Why start here

Teams that begin with a single account tend to add structure under pressure, once there are production workloads, auditors and a growing bill. Moving things later means re-plumbing networks and permissions while people depend on them.

## Treat it as code

Define the landing zone in infrastructure as code, such as Terraform, and review changes like any other software. That makes the foundation reproducible, auditable and easy to hand over.

If you are planning a migration or a new platform, a short assessment of your current setup is often the cheapest way to decide what the foundation should look like.
