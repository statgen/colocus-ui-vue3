## Pages

### Search page

The <a href="/search">search page</a> looks like the following:

<img src="help-images/search-overview.png" alt="search table overview image">

There are 2 main elements to the search page:

1. Filter panel (left side)
2. Colocalization results table (right side)

The filter panel allows you to filter the colocalization results table. The colocalization results table displays the results of the colocalization analyses.

#### Colocalization results table

Each row in the table is the result of colocalizing signals associated with two different traits. Conditionally independent or fine-mapped signals are labeled by a lead variant (`Trait 1 Variant` or `Trait 2 Variant`). In reality, each signal may be a credible set containing multiple variants (such is the case with SuSiE's credible sets.) We will likely add support for showing the credible set in a future release.

At the bottom of the table are controls that allow you to traverse the data set, set the number of rows to display, and download the currently displayed data.

The colocalization results table has the following columns:

| Column                       | Description                                                                            |
|------------------------------|----------------------------------------------------------------------------------------|
| Study 1                      | Study from which the first signal comes                                                |
| Trait 1                      | Associated trait for the first signal                                                  |
| Study 2                      | Study from which the first signal comes                                                |
| Trait 2                      | Associated trait for the second signal                                                 |
| Trait 2 Type                 | Trait 2's type (gene or exon expression, methylation, etc.                             |
| Trait 2 Tissue               | Tissue in which trait 2 is measured                                                    |
| Trait 1 Variant              | Lead variant associated with trait 1                                                   |
| Trait 2 Variant              | Lead variant associated with trait 2                                                   |
| Trait 1 -log10p              | -log10(p-value) of association between lead variant and trait 1                        |
| Trait 2 -log10p              | -log10(p-value) of association between lead variant and trait 2                        |
| H3                           | Posterior probability of H3 from coloc                                                 |
| H4                           | Posterior probability of H4 from coloc                                                 |
| R2                           | Linkage disequilibrium (r2) between the two lead variants                              |
| # coloc between traits       | Number of colocalizations (H4 > 0.5) between trait 1 and 2                             |
| Effect Direction Concordance | Denotes whether direction of effect for the two colocalized lead variants is concordant|

The last column denotes whether directions of effect for the two colocalized variants are discordant between the two traits.

There are two colocalized variants, one for each trait. The two colocalized variants have an effect size in the marginal summary statistics for each trait. We can build a 2x2 table from these effect sizes:

⎡ sign(β<sub>1,1</sub>) sign(β<sub>1,2</sub>) ⎤
⎣ sign(β<sub>2,1</sub>) sign(β<sub>2,2</sub>) ⎦

Where sign(β<sub>1,1</sub>) is the effect direction of trait 1 variant in trait 1's marginal summary statistics, sign(β<sub>1,2</sub>) is the effect direction of trait 1 variant in trait 2's marginal summary statistics, etc.

The effect directions for both variants are oriented toward the alternate allele (the second allele in the variant ID).

Discordance occurs when the pattern of effect size directions changes from the first to second variant,
in other words:

sign(β<sub>1,1</sub>) * sign(β<sub>1,2</sub>) != sign(β<sub>2,1</sub>) * sign(β<sub>2,2</sub>)

Effects are indicated with colors:

<table>
  <thead>
  <tr>
    <td></td>
    <td></td>
    <td></td>
  </tr>
  </thead>
  <tbody>
  <tr>
    <td class="rpad"></td>
    <td class="bg-clcEffPos">Positive effect direction</td>
    <td class="bg-clcEffNeg">Negative effect direction</td>
  </tr>
  <tr>
    <td class="rpad"></td>
    <td class="bg-clcEffZero">Effect is zero</td>
    <td class="bg-clcEffNA">Effect is missing (NA)</td>
  </tr>
  </tbody>
</table>

#### Filter panel

The table can be filtered using the filter panel on the left hand side. The filters work as follows:

- **Study**: Only show colocalizations from a study or set of studies. The filter will match both `Study 1` or `Study 2`.
- **QTL Gene**: Only show colocalizations for a gene or set of genes. Note that currently in colocus only `Trait 2` can be a gene expression trait. In the future, it is possible that we may have results provided for colocalizations between eQTLs.
- **Genomic Region**: Only show results within a genomic region. The filter must be provided in the format `{chromsoome}:{start}-{end}`. For example, `1:1000000-2000000` would Only show results on chromosome 1 between 1,000,000 and 2,000,000 bp. This filter matches against both the `Trait 1 Variant` and `Trait 2 Variant` columns.
- **GWAS Phenotype**: Only show colocalizations for a GWAS phenotype or set of GWAS phenotypes. Currently only `Trait 1` can be a GWAS trait. In the future, it is possible that we may have results provided for colocalizations between GWAS traits.
- **QTL Tissue**: Filter the `Trait 2 Tissue` column.
- **Trait 1 -log10 p-value** or **Trait 2 -log10 p-value**: Only show colocalizations where the -log10 p-value of the association between the lead variant and the trait is greater than or equal to the provided value.
- **Colocalization PP(H4)**: Only show colocalizations where the posterior probability of H4 is greater than or equal to the provided value.
- **R2**: Only show colocalizations where the linkage disequilibrium (r2) between the two lead variants is greater than or equal to the provided value.

At the bottom of the filter panel are two checkboxes:

- **Show Ensembl IDs**: Add a column to the table showing Ensembl IDs. Standard ENSG IDs are given for genes. For exons, the ID may be either the standard ENSE ID, or a custom ID in the format `ENSG<ID>_start_end` where `ID` is the Ensembl gene ID, `start` is the start position of the exon, and `end` is the end position of the exon.
- **Show effect sizes**: Adds columns showing the effect sizes for the lead variants of the two traits. Both the marginal and conditional effect sizes are shown.

### LocusZoom page

Clicking on any row in the table of colocalization results will bring you to the LocusZoom page, [for example](coloc/AWMLDTtPNxrU6aWh9wB8X3):

<img src="help-images/locuszoom-page-example.png" alt="locuszoom page overview image">

This page initially highlights a single colocalization result. The two traits with colocalizing signals are shown at the top in text, along with the lead variants for each signal. For example:

> Colocalization of Type 2 diabetes (8_41508577_C_A) with ANK1 (8_41519248_T_C)

Following this are 3 plots:

- **LocusCompare plot**: We plot the -log10 conditional p-value for each variant in the two different traits. The conditional p-value is the p-value after having performed conditional analysis or fine-mapping. The x-axis is the -log10 p-value for the variant in one of the traits (listed in the axis label), and similarly for the y-axis. Each variant is colored by its LD with the reference variant, shown in purple.

  The reference variant is initially set to the lead variant of the conditional signal from the first shown trait in the LocusZoom plots. If the lead variant is not the same in both traits, the reference variant can be changed by using the controls below the LocusCompare plot.

- **LocusZoom plots**: On the right hand side are two LocusZoom plots, one for each trait. The -log10 p-values shown are also the conditional p-values after fine-mapping. The marginal p-values are also available before fine-mapping by using the radio buttons below the LocusCompare plot for changing the `y-axis` to `Marginal -log10p`. A separate panel beneath the two plots shows nearby genes.

Below the plots is a table showing all other known colocalized signals in the same region (where the region is defined as being within a 500kb window centered around the lead variants of the two colocalized signals.)

The table follows the same format as the colocalization results table on the search page, with an additional button on the left hand side under the `Add plots` column. Clicking this button will add two LocusZoom panels above, one for each trait's associated signals.

### Manhattan plot page

On the search page, hovering over a trait's green star will bring up a menu:

<img src="help-images/trait-menu.png" alt="trait menu on search page">

From here, clicking on *View local Manhattan plot* will take you to the manhattan plot page for that trait. The manhattan plot page looks like the following:

<img src="help-images/manhattan-page.png" alt="manhattan plot page overview image">

At the top is a manhattan plot showing associations between all variants and the trait. The x-axis is the genomic position of the variant, and the y-axis is the -log10 p-value of the association. The blue/grey colors alternate by chromosome.

Each red dot corresponds to a variant that colocalizes with another trait. Clicking on the red dot will filter the colocalization results table to show only colocalizations involving that variant. By default, the table shows all colocalization results genome-wide for the trait.

## FAQ

* The tables can be very wide, and don't seem to scroll without a trackpad.

   If you have a mouse with a scroll wheel, you can scroll horizontally by holding the shift key and scrolling with the scroll wheel.

* I can't seem to find a gene on the LocusZoom plot.

   A few things may be happening here:

   1. The gene may be filtered out if it is not a protein coding gene by default. To enable all genes, click the "Gene Filter" button in the LocusZoom plot, and select "All features."
   2. LocusZoom only shows a few rows of genes by default. You can expand the gene panel by grabbing the bottom of the panel and dragging it down.
   3. The gene could be in a version of GENCODE that we are not using. LocusZoom currently uses GENCODE v35.
