# JUDGELAYER Judging Methodology & Normalization Engine

## 1. Rubric Architecture & Weights

Each project is evaluated across 4 standardized criteria, rated on a continuous or discrete scale from 1.0 to 5.0:

| Criterion | Weight | Definition |
| :--- | :---: | :--- |
| **Functionality** | 30% | Does the project actually work? Verification of core capabilities, error handling, and demo readiness. |
| **Code & Architecture Quality** | 25% | Modularity, clarity, test coverage, security hygiene, and clean architectural separation of concerns. |
| **Technical Innovation** | 25% | Novelty of approach, creative problem solving, and technical depth over boilerplate assembly. |
| **Impact & Viability** | 20% | Real-world usefulness, developer ergonomics, adoptability, and ecosystem relevance. |

### Raw Ballot Composite Score
$$\text{RawScore} = (0.30 \times F) + (0.25 \times Q) + (0.25 \times I) + (0.20 \times M)$$

---

## 2. Normalization Methodology: Combating Judge Bias

In hackathons, two systematic judge biases degrade result defensibility:
1. **Harshness / Lenience Divergence**: Judge A averages 3.2 across all projects, while Judge B averages 4.8. A team assigned to Judge A is penalized through no fault of their own.
2. **Score Compression**: A judge assigns 5.0 to every project they review, providing zero discriminatory power between good and exceptional projects.

### Step 1: Compute Judge Calibration Parameters
For each judge $j$ with $N_j \ge 2$ submitted ballots:
$$\mu_j = \frac{1}{N_j} \sum_{k=1}^{N_j} S_{j,k}$$
$$\sigma_j = \sqrt{\frac{1}{N_j} \sum_{k=1}^{N_j} (S_{j,k} - \mu_j)^2}$$

If $\sigma_j < 0.15$ (Score Compression Detected), the engine flags this judge in the Organizer Command Center and caps variance stabilization to avoid infinite z-scores.

### Step 2: Z-Score Standardization
For each raw score $S_{j,p}$ given by judge $j$ to project $p$:
$$Z_{j,p} = \frac{S_{j,p} - \mu_j}{\max(\sigma_j, 0.25)}$$

### Step 3: Rescale to Normalized 1–5 Distribution
To restore scores into a human-interpretable 1.0–5.0 range, z-scores are mapped across the global sample mean $\mu_{\text{global}}$ and standard deviation $\sigma_{\text{global}}$:
$$S^{\text{norm}}_{j,p} = \text{clamp}\left(\mu_{\text{global}} + (Z_{j,p} \times \sigma_{\text{global}}), 1.0, 5.0\right)$$

### Project Aggregate Score
$$S_p = \frac{1}{|J_p|} \sum_{j \in J_p} S^{\text{norm}}_{j,p}$$

---

## 3. Edge-Case Intelligence Rules

### A. Incomplete Review Batches
- **Rule**: Standard target is 3 reviews per project.
- **Trigger**: Any project with $1 \le |J_p| < 3$ reviews is flagged with a warning in the Organizer Console (e.g. `DocuSift` with 1/3 reviews).
- **Resolution**: Organizers can reassign or prioritize pending reviews directly in the interactive Assignment Matrix.

### B. Duplicate Submissions
- **Rule**: Teams occasionally submit duplicate repositories or drafts under differing slugs.
- **Trigger**: Detected via Levenshtein title similarity ($>85\%$) or identical repository URLs.
- **Resolution**: Flagged in System Insights. Organizers can merge or archive duplicate entries.

### C. Judge Peer Isolation
- **Rule**: Neither judges nor participants may access peer review drafts or raw scoring sheets.
- **Enforcement**: Validated in backend middleware with an immutable audit log trail on any 403 breach attempt.
