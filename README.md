# Week 5 — Polite Web Scraper

A polite, cache-first web scraper built with Node.js for the Week-5 internship assignment.

The scraper collects book information from **Books to Scrape**, processes three catalogue pages, discovers unique book URLs, fetches individual detail pages, normalizes and validates the extracted data, and produces JSON output and a run report.

## Features

* Scrapes 3 catalogue pages
* Discovers unique book URLs
* Extracts book details using Cheerio
* Uses a local cache to avoid unnecessary network requests
* Adds a descriptive `User-Agent`
* Enforces a delay after real network requests
* Normalizes scraped values before validation
* Validates records using Zod
* Separates valid records and validation errors
* Generates a run report
* Handles failed pages without terminating the complete run
* Produces deterministic, idempotent output

## Tech Stack

* Node.js
* JavaScript
* Cheerio
* Zod
* Git / GitHub

## Project Structure

```text
week5-polite-scraper/
│
├── src/
│   ├── index.js
│   ├── fetcher.js
│   ├── parser.js
│   ├── scraper.js
│   ├── normalizer.js
│   └── schema.js
│
├── output/
│   ├── books.json
│   ├── errors.json
│   └── run-report.json
│
├── cache/
│   └── locally cached HTML files
│
├── package.json
├── package-lock.json
├── README.md
└── .gitignore
```

The `cache/` directory is intentionally ignored by Git because it contains locally cached HTML pages.

## Installation

Clone the repository and enter the project directory:

```powershell
git clone https://github.com/Ayush8521/week5-polite-scraper.git
cd week5-polite-scraper
```

Install dependencies:

```powershell
npm install
```

## Run the Scraper

Run:

```powershell
npm start
```

The scraper processes the first three catalogue pages and extracts the discovered book detail pages.

The generated files are stored in:

```text
output/
```

## Output Files

### `output/books.json`

Contains the successfully normalized and validated book records.

Each record contains fields such as:

```json
{
  "title": "A Light in the Attic",
  "product_url": "https://books.toscrape.com/catalogue/a-light-in-the-attic_1000/index.html",
  "price": 51.77,
  "currency": "GBP",
  "availability": 22,
  "rating": 3,
  "description": "...",
  "source_page": "https://books.toscrape.com/catalogue/page-1.html",
  "fetched_at": "2026-08-28T..."
}
```

### `output/errors.json`

Contains records that fail schema validation.

The current successful run produced:

```text
error_records=0
```

### `output/run-report.json`

Contains execution statistics:

```json
{
  "start_time": "...",
  "duration_ms": 0,
  "pages_fetched": 0,
  "cache_hits": 63,
  "valid_records": 60,
  "invalid_records": 0,
  "failed_pages": 0
}
```

## Validation Results

Successful run:

```text
catalogue_pages=3
discovered=60
unique_urls=60
detail_pages=60
valid_records=60
error_records=0
failed_pages=0
```

The generated dataset contains:

```text
60 valid records
0 invalid records
```

## Cache Behavior

The scraper uses a cache-first strategy.

If a requested page already exists in the local cache:

```text
CACHE HIT: <url>
```

the cached HTML is used and no network request is made.

For a real network request:

```text
FETCH: <url>
```

the response is saved locally and a delay is applied before the next request.

This reduces unnecessary repeated requests to the target website.

## Politeness

The scraper identifies itself with a descriptive User-Agent:

```text
FlyRankInternship-A9/1.0
```

The scraper also uses a request timeout and waits after real network requests.

Cached requests do not require an additional network delay.

## Failure Handling

Individual page failures are handled without terminating the entire scraper.

A deliberately invalid URL was used during testing to verify this behavior.

The expected failure-test result is:

```text
valid_records=60
failed_pages=1
```

The normal run is then restored to:

```text
valid_records=60
failed_pages=0
```

## Idempotency

The scraper can be run repeatedly without appending duplicate records.

Verification:

```powershell
(Get-Content output\books.json | ConvertFrom-Json).Count
```

Result:

```text
60
```

Running the scraper again continues to produce:

```text
60
```

records.

## Browser Comparison

The assignment also requires a comparison between direct browser access and programmatic requests.

Direct browser access:

```text
https://books.toscrape.com/catalogue/page-1.html
```

The same catalogue page is fetched programmatically by the scraper.

The scraper's output demonstrates that the required catalogue information can be obtained using an HTTP request and HTML parsing without browser automation.

## Limitations

This project is intentionally designed as a small educational scraper.

* It processes only the first three catalogue pages.
* It does not use browser automation.
* It uses local filesystem caching.
* It targets the static HTML structure of Books to Scrape.
* Changes to the target site's HTML structure may require selector updates.

## Author

**Ayush Tiwari**

GitHub:

https://github.com/Ayush8521

Repository:

https://github.com/Ayush8521/week5-polite-scraper
