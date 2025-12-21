# Product Requirements Document (PRD)

## Product Name
**LedgerOne**

---

## One-Line Vision
A text-first, keyboard-native web brokerage for experienced investors who prioritize execution quality, data integrity, and control over visual excess.

---

## 1. Purpose & Product Definition

### Purpose
LedgerOne is a **professional-grade execution and portfolio intelligence interface** built on top of licensed brokerage infrastructure.  
It enables fast, precise trading and long-horizon wealth analysis through a dense, deterministic, text-driven UI.

### Product Definition
LedgerOne is:
- An execution console + portfolio system
- A daily operational tool, not a discovery or education platform
- Opinionated toward clarity, safety, and predictability

LedgerOne is **not**:
- A learning platform
- A social product
- A visual analytics or charting terminal

---

## 2. Goals & Non-Goals

### Goals
- Deterministic UI behavior (no surprise states)
- Keyboard-first, mouse-optional interaction
- Clear mental separation between:
  - Execution
  - Long-term investing
  - Portfolio & risk analysis
- Strong guardrails against execution errors
- Auditability by design

### Non-Goals
- Gamification or engagement loops
- Influencer, feed, or community features
- Real-time speculative charting as a primary workflow
- Beginner hand-holding or tutorials

---

## 3. Target Users

### Primary Personas

#### Active Retail Trader
- Executes multiple orders per session
- Requires fast modification, cancellation, and visibility
- Sensitive to latency and UI friction

#### Long-Term Investor
- Focused on allocation, compounding, and risk
- Reviews portfolio periodically
- Values clean reporting and historical accuracy

#### Power / Semi-Professional User
- Uses spreadsheets, scripts, or terminals
- Expects exports, raw numbers, and consistency
- Heavy keyboard and command usage

---

## 4. Platform Scope

### Platforms
- Web (desktop-first)
- Mobile web:
  - Read-only by default
  - Limited actions with explicit confirmations
- No native apps in Phase 1

### Market Coverage (Phased)

- **Phase 1**
  - Indian Equities
  - ETFs
- **Phase 2**
  - Options
  - Futures
- **Phase 3**
  - Bonds
  - Mutual Funds
- **Phase 4**
  - Global markets (read-only → execution later)

---

## 5. Brokerage & Regulatory Model

- Operates as a **non-custodial frontend** in Phase 1
- Integrates with one or more licensed broker APIs
- Clearing, settlement, and custody handled externally
- Full compliance with:
  - KYC / AML
  - Exchange and broker audit requirements
- Immutable audit logs for all user actions

---

## 6. Design Philosophy — Text-First by Default

### Principles
- Text and tables are the primary medium
- Charts are secondary and optional
- Information density without ambiguity
- Zero decorative UI elements

### Hard Interaction Constraints
- Every action executable via keyboard
- No blocking modal dialogs
- Inline validation and inline errors only
- Explicit state transitions (no hidden automation)
- All system messages logged chronologically

### Visual Characteristics
- Monospaced or near-monospaced typography
- High-contrast themes (light & dark)
- Terminal-like panels and tables
- Expand-in-place details, never new contexts

---

## 7. Core Modules & Features

### 7.1 Authentication & Accounts
- Secure authentication with mandatory 2FA
- Multiple logical accounts:
  - Trading
  - Investing
  - Sub-accounts
- Instant account switching via command palette
- Full per-account audit history

---

### 7.2 Trading Module

#### Supported Actions
- Buy / Sell
- Market, Limit, Stop-Loss, Bracket orders
- Modify / Cancel

#### Order Entry
- Structured text input or command syntax
- Real-time validation (price, quantity, margins)
- Clear, human-readable order preview

#### Risk & Safety
- Mandatory confirmation for market orders
- User-defined max order size and value limits
- Explicit echo of:
  - Instrument
  - Side
  - Quantity
  - Price
- No silent failures

#### Order Management
- Open orders table
- Trade execution log
- Full order lifecycle timestamps
- Deterministic status states

---

### 7.3 Investing Module

- Long-term equity and ETF holdings
- SIP creation and tracking
- Goal-based buckets
- Dividend tracking
- Corporate action handling (splits, bonuses, mergers)

---

### 7.4 Portfolio & Wealth Intelligence

#### Portfolio Views
- Holdings with cost basis
- Realized vs unrealized P&L
- Asset and sector allocation

#### Wealth Overview
- Net worth snapshot
- Historical net worth (table + optional chart)
- Cash vs invested breakdown

#### Analytics
- CAGR
- Volatility
- Max drawdown
- Concentration metrics

#### Benchmarking
- Index comparisons (e.g. NIFTY, SENSEX)
- Alpha and relative performance
- Rolling and period-based analysis

---

### 7.5 Market Data

- Live price streaming
- OHLC data (tabular)
- Corporate actions feed
- Earnings and dividend events
- Explicit stale or delayed data indicators

---

### 7.6 Discovery & Monitoring

- Text-based watchlists
- Screeners:
  - Price
  - Volume
  - Fundamentals
- Saved and reusable scans

---

### 7.7 Alerts & Notifications

- Price thresholds
- Order lifecycle events
- Risk and exposure alerts

Delivery Channels:
- In-app system log
- Email (optional)

---

### 7.8 Reports & Data Access

- Trade history
- P&L statements
- Tax reports
- CSV / Excel exports
- Public API (future phase)

---

## 8. Power User Capabilities

- Global keyboard shortcuts
- Command palette for:
  - Navigation
  - Trading
  - Analysis
- Custom saved layouts and views

### Strategy Visibility (Read-Only Initially)
- Option payoff tables
- Exposure summaries
- Greeks (Phase 2)

---

## 9. Failure Handling & Degradation

- Explicit degraded-mode banners
- Read-only fallback during outages
- Partial-data warnings
- No ambiguous or frozen UI states

---

## 10. Non-Functional Requirements

### Performance
- UI interactions < 100ms
- Order submission < 300ms (excluding exchange latency)
- Immediate feedback on all actions

### Reliability
- 99.9% uptime during market hours
- Automatic recovery from feed failures

### Security
- Token-based authentication
- Per-action audit logging
- Device and session tracking
- IP-level anomaly detection

---

## 11. Technical Architecture (Indicative)

### Frontend
- React / Next.js
- Minimal utility CSS
- Strict layout and state discipline

### Backend
- REST + WebSockets
- Event-driven order pipeline

### Data Layer
- Market data integrations
- Time-series storage for prices and metrics

---

## 12. Success Metrics

### Product
- Funded active accounts
- Orders per active trader
- Long-term portfolio retention

### Quality
- Time to place order
- Order modification frequency
- Keyboard usage adoption
- Report and export usage

---

## 13. Key Risks

- Regulatory and compliance overhead
- Market data latency dependencies
- Execution safety in text-based workflows
- Balancing density with cognitive load

---

## 14. Roadmap

- Public API
- Strategy backtesting
- Informational AI insights (non-executing)
- Multi-broker and global integrations

---

## 15. Summary

LedgerOne is a disciplined, execution-focused brokerage interface built for users who think in tables, constraints, and outcomes.  
It removes noise, enforces clarity, and treats trading and investing as serious operational activities—not entertainment.
