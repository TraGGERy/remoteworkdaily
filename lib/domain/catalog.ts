/**
 * Bounded Context: Job Catalog
 * Domain models and invariants for remote jobs, salary standards, and search indexing.
 */

export interface ISalaryRange {
  min?: number;
  max?: number;
  currency: string;
}

export class SalaryRange {
  readonly min?: number;
  readonly max?: number;
  readonly currency: string;

  constructor(data: ISalaryRange) {
    if (data.min !== undefined && data.min < 0) {
      throw new Error("Salary minimum cannot be negative");
    }
    if (data.max !== undefined && data.max < 0) {
      throw new Error("Salary maximum cannot be negative");
    }
    if (data.min !== undefined && data.max !== undefined && data.min > data.max) {
      throw new Error("Salary minimum cannot exceed maximum");
    }
    this.min = data.min;
    this.max = data.max;
    this.currency = (data.currency || "USD").toUpperCase();
  }

  get isOpenSalary(): boolean {
    return Boolean(this.min || this.max);
  }

  format(): string {
    if (!this.min && !this.max) return "Competitive (Unspecified)";
    const curr = this.currency;
    const isSubThousand = (this.max != null && this.max < 1000) || (this.min != null && this.min < 1000 && (this.max == null || this.max < 1000));
    if (isSubThousand) {
      if (this.min && this.max) {
        return `$${this.min} - $${this.max} ${curr}`;
      }
      if (this.min) {
        return `From $${this.min} ${curr}`;
      }
      return `Up to ${this.max} ${curr}`;
    }
    if (this.min && this.max) {
      return `$${Math.round(this.min / 1000)}k - $${Math.round(this.max / 1000)}k ${curr}`;
    }
    if (this.min) {
      return `From $${Math.round(this.min / 1000)}k ${curr}`;
    }
    return `Up to $${Math.round((this.max as number) / 1000)}k ${curr}`;
  }
}

export interface ISchemaCountry {
  "@type": "Country";
  name: string;
}

const US_STATES = [
  "alabama", "alaska", "arizona", "arkansas", "california", "colorado", "connecticut", "delaware", "florida", "georgia",
  "hawaii", "idaho", "illinois", "indiana", "iowa", "kansas", "kentucky", "louisiana", "maine", "maryland",
  "massachusetts", "michigan", "minnesota", "mississippi", "missouri", "montana", "nebraska", "nevada", "new hampshire", "new jersey",
  "new mexico", "new york", "north carolina", "north dakota", "ohio", "oklahoma", "oregon", "pennsylvania", "rhode island", "south carolina",
  "south dakota", "tennessee", "texas", "utah", "vermont", "virginia", "washington", "west virginia", "wisconsin", "wyoming", "district of columbia"
];

const US_STATE_CODES = new Set([
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY", "DC"
]);

const COUNTRY_RULES: Array<{ name: string; iso: string; patterns: RegExp[] }> = [
  {
    name: "United States",
    iso: "US",
    patterns: [
      /\b(united states|usa|u\.s\.a\.|u\.s\.|us)\b/i,
      /\b(san francisco|new york|nyc|los angeles|chicago|seattle|austin|boston|denver|atlanta|dallas|houston|miami|san jose|san diego|portland|philadelphia|phoenix|minneapolis|detroit|salt lake city|raleigh|charlotte|nashville|tampa|orlando|pittsburgh|boulder|sunnyvale|mountain view|palo alto|redmond|cupertino|menlo park|cambridge|santa monica|oakland|bellevue|plano|irvine|sacramento|oklahoma city|brooklyn|manhattan|jersey city|newark)\b/i,
    ],
  },
  {
    name: "United Kingdom",
    iso: "GB",
    patterns: [
      /\b(united kingdom|great britain|britain|england|scotland|northern ireland|uk|u\.k\.)\b/i,
      /(?<!new south\s)\bwales\b/i,
      /\b(london|manchester|birmingham|edinburgh|glasgow|bristol|leeds|oxford)\b/i,
    ],
  },
  {
    name: "Canada",
    iso: "CA",
    patterns: [
      /\b(canada)\b/i,
      /\b(toronto|vancouver|montreal|ottawa|calgary|edmonton|ontario|quebec|alberta|nova scotia|mississauga)\b/i,
      /\b(ON|BC|AB|QC|NS|MB|SK)\b/,
    ],
  },
  {
    name: "Germany",
    iso: "DE",
    patterns: [
      /\b(germany|deutschland)\b/i,
      /\b(berlin|munich|münchen|hamburg|frankfurt|cologne|köln|stuttgart|düsseldorf|dusseldorf|leipzig|dresden|nuremberg|nürnberg|bonn|verden|gilching|bayern|puchheim|groß-gerau|niedersachsen|hessen)\b/i,
    ],
  },
  {
    name: "France",
    iso: "FR",
    patterns: [
      /\b(france)\b/i,
      /\b(paris|lyon|marseille|toulouse|bordeaux|nantes|lille)\b/i,
    ],
  },
  {
    name: "Australia",
    iso: "AU",
    patterns: [
      /\b(australia)\b/i,
      /\b(sydney|melbourne|brisbane|perth|adelaide|new south wales|victoria|queensland)\b/i,
      /\b(NSW|VIC|QLD|WA)\b/,
    ],
  },
  {
    name: "Netherlands",
    iso: "NL",
    patterns: [
      /\b(netherlands|nederland|holland)\b/i,
      /\b(amsterdam|rotterdam|utrecht|the hague|eindhoven)\b/i,
    ],
  },
  {
    name: "Spain",
    iso: "ES",
    patterns: [
      /\b(spain|españa)\b/i,
      /\b(madrid|barcelona|valencia|seville|bilbao|malaga)\b/i,
    ],
  },
  {
    name: "Ireland",
    iso: "IE",
    patterns: [
      /\b(ireland)\b/i,
      /\b(dublin|cork|galway|limerick)\b/i,
    ],
  },
  {
    name: "Switzerland",
    iso: "CH",
    patterns: [
      /\b(switzerland|schweiz|suisse)\b/i,
      /\b(zurich|zürich|geneva|genève|basel|bern|lausanne|zug)\b/i,
    ],
  },
  {
    name: "India",
    iso: "IN",
    patterns: [
      /\b(india)\b/i,
      /\b(bangalore|bengaluru|mumbai|delhi|new delhi|hyderabad|pune|chennai|gurgaon|noida)\b/i,
    ],
  },
  {
    name: "Singapore",
    iso: "SG",
    patterns: [/\b(singapore)\b/i],
  },
  {
    name: "Japan",
    iso: "JP",
    patterns: [
      /\b(japan)\b/i,
      /\b(tokyo|osaka|kyoto|yokohama)\b/i,
    ],
  },
  {
    name: "Brazil",
    iso: "BR",
    patterns: [
      /\b(brazil|brasil)\b/i,
      /\b(são paulo|sao paulo|rio de janeiro|curitiba|belo horizonte)\b/i,
    ],
  },
  {
    name: "Poland",
    iso: "PL",
    patterns: [
      /\b(poland|polska)\b/i,
      /\b(warsaw|warszawa|krakow|kraków|wroclaw|wrocław|gdansk)\b/i,
    ],
  },
  {
    name: "Sweden",
    iso: "SE",
    patterns: [
      /\b(sweden|sverige)\b/i,
      /\b(stockholm|gothenburg|göteborg|malmö)\b/i,
    ],
  },
  {
    name: "Portugal",
    iso: "PT",
    patterns: [
      /\b(portugal)\b/i,
      /\b(lisbon|lisboa|porto)\b/i,
    ],
  },
  {
    name: "Italy",
    iso: "IT",
    patterns: [
      /\b(italy|italia)\b/i,
      /\b(rome|roma|milan|milano|turin|florence)\b/i,
    ],
  },
  {
    name: "New Zealand",
    iso: "NZ",
    patterns: [
      /\b(new zealand)\b/i,
      /\b(auckland|wellington|christchurch)\b/i,
    ],
  },
  {
    name: "Mexico",
    iso: "MX",
    patterns: [
      /\b(mexico|méxico)\b/i,
      /\b(mexico city|guadalajara|monterrey)\b/i,
    ],
  },
  {
    name: "Philippines",
    iso: "PH",
    patterns: [
      /\b(philippines)\b/i,
      /\b(manila|cebu|davao)\b/i,
    ],
  },
  {
    name: "South Africa",
    iso: "ZA",
    patterns: [
      /\b(south africa)\b/i,
      /\b(cape town|johannesburg|pretoria|durban)\b/i,
    ],
  },
  {
    name: "Denmark",
    iso: "DK",
    patterns: [/\b(denmark|danmark|copenhagen)\b/i],
  },
  {
    name: "Norway",
    iso: "NO",
    patterns: [/\b(norway|norge|oslo)\b/i],
  },
  {
    name: "Finland",
    iso: "FI",
    patterns: [/\b(finland|helsinki)\b/i],
  },
  {
    name: "Austria",
    iso: "AT",
    patterns: [/\b(austria|österreich|vienna|wien)\b/i],
  },
  {
    name: "Belgium",
    iso: "BE",
    patterns: [/\b(belgium|belgique|brussels|bruxelles)\b/i],
  },
  {
    name: "Czech Republic",
    iso: "CZ",
    patterns: [/\b(czech republic|czechia|prague|praha)\b/i],
  },
  {
    name: "Israel",
    iso: "IL",
    patterns: [/\b(israel|tel aviv|jerusalem)\b/i],
  },
  {
    name: "Turkey",
    iso: "TR",
    patterns: [/\b(turkey|türkiye|istanbul|ankara)\b/i],
  },
  {
    name: "China",
    iso: "CN",
    patterns: [/\b(china|beijing|shanghai|shenzhen)\b/i],
  },
  {
    name: "Hong Kong",
    iso: "HK",
    patterns: [/\b(hong kong)\b/i],
  },
  {
    name: "Taiwan",
    iso: "TW",
    patterns: [/\b(taiwan|taipei)\b/i],
  },
  {
    name: "Greece",
    iso: "GR",
    patterns: [/\b(greece|athens)\b/i],
  },
  {
    name: "Zimbabwe",
    iso: "ZW",
    patterns: [/\b(zimbabwe|harare|bulawayo)\b/i],
  },
  {
    name: "Kenya",
    iso: "KE",
    patterns: [/\b(kenya|nairobi|mombasa)\b/i],
  },
  {
    name: "Nigeria",
    iso: "NG",
    patterns: [/\b(nigeria|lagos|abuja)\b/i],
  },
  {
    name: "Ghana",
    iso: "GH",
    patterns: [/\b(ghana|accra)\b/i],
  },
  {
    name: "Egypt",
    iso: "EG",
    patterns: [/\b(egypt|cairo|alexandria)\b/i],
  },
  {
    name: "Argentina",
    iso: "AR",
    patterns: [/\b(argentina|buenos aires)\b/i],
  },
  {
    name: "Colombia",
    iso: "CO",
    patterns: [/\b(colombia|bogota|bogotá|medellin|medellín)\b/i],
  },
  {
    name: "Chile",
    iso: "CL",
    patterns: [/\b(chile|santiago)\b/i],
  },
  {
    name: "Costa Rica",
    iso: "CR",
    patterns: [/\b(costa rica|san jose)\b/i],
  },
];

const GLOBAL_DEFAULT_COUNTRIES = [
  "United States",
  "United Kingdom",
  "Canada",
  "Australia",
  "Germany",
];

const ISO_MAP: Record<string, string> = {
  "United States": "US",
  "United Kingdom": "GB",
  Canada: "CA",
  Germany: "DE",
  France: "FR",
  Australia: "AU",
  Netherlands: "NL",
  Spain: "ES",
  Ireland: "IE",
  Switzerland: "CH",
  India: "IN",
  Singapore: "SG",
  Japan: "JP",
  Brazil: "BR",
  Poland: "PL",
  Sweden: "SE",
  Portugal: "PT",
  Italy: "IT",
  "New Zealand": "NZ",
  Mexico: "MX",
  Philippines: "PH",
  "South Africa": "ZA",
};

export class LocationEligibility {
  readonly rawLocation: string;
  readonly isWorldwide: boolean;
  readonly workplaceType: "remote" | "hybrid" | "on-site";

  constructor(rawLocation: string, workplaceType: "remote" | "hybrid" | "on-site" = "remote") {
    this.rawLocation = rawLocation?.trim() || "Worldwide";
    this.workplaceType = workplaceType;
    const normalized = this.rawLocation.toLowerCase();
    this.isWorldwide =
      normalized.includes("worldwide") ||
      normalized.includes("anywhere") ||
      normalized === "ww" ||
      normalized === "global" ||
      normalized === "remote" ||
      normalized === "remote job" ||
      normalized === "homeoffice" ||
      normalized === "n/a" ||
      normalized === "";
  }

  get isTelecommute(): boolean {
    return this.workplaceType === "remote";
  }

  /**
   * Resolves list of valid country names eligible for this job.
   * Google Jobs requires explicit Country objects under applicantLocationRequirements.
   */
  getEligibleCountries(): string[] {
    if (!this.rawLocation || this.isWorldwide) {
      return GLOBAL_DEFAULT_COUNTRIES;
    }

    const text = this.rawLocation;
    const lower = text.toLowerCase();

    // Check for US state codes or names
    let hasUsState = false;
    const uppercaseWords = text.match(/\b([A-Z]{2})\b/g);
    if (uppercaseWords) {
      for (const code of uppercaseWords) {
        if (US_STATE_CODES.has(code)) {
          hasUsState = true;
          break;
        }
      }
    }
    if (!hasUsState) {
      for (const st of US_STATES) {
        if (new RegExp(`\\b${st}\\b`, "i").test(text)) {
          hasUsState = true;
          break;
        }
      }
    }

    const matched: string[] = [];
    for (const rule of COUNTRY_RULES) {
      if (rule.patterns.some((p) => p.test(text))) {
        if (!matched.includes(rule.name)) {
          matched.push(rule.name);
        }
      }
    }

    if (hasUsState && !matched.includes("United States")) {
      matched.push("United States");
    }

    // Broad regional expansions
    if (lower.includes("europe") || lower.includes("emea")) {
      ["United Kingdom", "Germany", "France", "Netherlands", "Ireland", "Spain"].forEach((c) => {
        if (!matched.includes(c)) matched.push(c);
      });
    } else if (lower.includes("latam") || lower.includes("latin america")) {
      ["Brazil", "Mexico", "Argentina", "Colombia"].forEach((c) => {
        if (!matched.includes(c)) matched.push(c);
      });
    } else if (lower.includes("apac") || lower.includes("asia")) {
      ["Singapore", "Japan", "India", "Australia"].forEach((c) => {
        if (!matched.includes(c)) matched.push(c);
      });
    }

    if (matched.length === 0) {
      return GLOBAL_DEFAULT_COUNTRIES;
    }

    return matched;
  }

  get primaryCountry(): string {
    const countries = this.getEligibleCountries();
    return countries[0] || "United States";
  }

  get countryCode(): string {
    const primary = this.primaryCountry;
    return ISO_MAP[primary] || (this.isWorldwide ? "WW" : "US");
  }

  /**
   * Generates Schema.org compliant Country structured data for Google Search.
   * Google Jobs mandates that applicantLocationRequirements must be of @type: "Country"
   * (or an array of Country objects), and rejects AdministrativeArea.
   */
  toApplicantLocationRequirements(): ISchemaCountry | ISchemaCountry[] {
    const countries = this.getEligibleCountries();
    if (countries.length === 1) {
      return {
        "@type": "Country",
        name: countries[0],
      };
    }
    return countries.map((name) => ({
      "@type": "Country",
      name,
    }));
  }
}

export class JobSlug {
  static create(title: string, company: string): string {
    const combined = `${company}-${title}`;
    return combined
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }
}
