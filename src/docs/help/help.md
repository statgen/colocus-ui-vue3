## Pages

### Search Page

The <a href="/search">search page</a> looks like the following:

<img src="help-images/search-overview.png" alt="search table overview image">

There are 2 main elements to the search page:

1. Filter panel (left side)
2. Colocalization results table (right side)

The filter panel allows you to filter the colocalization results table. The colocalization results table displays the results of the colocalization analyses.

#### Colocalization Results Table

Each row in the table is the result of colocalizing signals associated with two different traits. Conditionally independent or fine-mapped signals are labeled by a lead variant (`Variant 1` or `Variant 2`). In reality, each signal may be a credible set containing multiple variants (such is the case with SuSiE's credible sets.) We will likely add support for showing the credible set in a future release.

At the bottom of the table are controls that allow you to traverse the data set, set the number of rows to display, and download the currently displayed data.

The colocalization results table has the following columns:

| Column                       | Description                                                                            |
|------------------------------|----------------------------------------------------------------------------------------|
| Study 1                      | Study from which the first signal comes                                                |
| Trait 1                      | Associated trait for the first signal                                                  |
| Type 1                       | Analysis type for first signal (GWAS, eQTL, pQTL, etc.)                                |
| Tissue 1                     | Tissue in which trait 1 is measured                                                    |
| Cell Type 1                  | Cell type in which trait 1 is measured                                                 |
| Study 2                      | Study from which the first signal comes                                                |
| Trait 2                      | Associated trait for the second signal                                                 |
| Type 2                       | Analysis type for second signal (GWAS, eQTL, pQTL, etc.)                               |
| Tissue 2                     | Tissue in which trait 2 is measured                                                    |
| Cell Type 2                  | Cell type in which trait 2 is measured                                                 |
| Variant 1                    | Lead variant associated with trait 1                                                   |
| Variant 2                    | Lead variant associated with trait 2                                                   |
| -log10p 1                    | -log10(p-value) of association between lead variant and trait 1                        | 
| -log10p 2                    | -log10(p-value) of association between lead variant and trait 2                        |
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

#### Filter Panel

The table can be filtered using the filter panel on the left hand side. The filters work as follows:

- **Study**: Only show colocalizations from a study or set of studies. The filter will match both `Study 1` or `Study 2`.
- **Analysis Types**: An analysis type can be "GWAS", "eQTL", "pQTL", "mQTL", etc. This will filter results to only be from the selected analysis types.
- **Analysis Columns**: Force a particular analysis type to column 1, or 2. If only one is selected, then the first set of columns will be restricted to that analysis type, and the remaining "2" columns can be of any type. 
- **eQTL Gene**: Only show colocalizations for a gene or set of genes.
- **Genomic Region**: Only show results within a genomic region. The filter must be provided in the format `{chromsoome}:{start}-{end}`. For example, `1:1000000-2000000` would Only show results on chromosome 1 between 1,000,000 and 2,000,000 bp. This filter matches against both the `Trait 1 Variant` and `Trait 2 Variant` columns.
- **GWAS Phenotype**: Only show colocalizations for a GWAS phenotype or set of GWAS phenotypes. Currently only `Trait 1` can be a GWAS trait. In the future, it is possible that we may have results provided for colocalizations between GWAS traits.
- **Tissue**: Filters to a tissue or set of tissues, and matches across both `Tissue 1` and `Tissue 2`.
- **GWAS -log10 p-value** or **eQTL -log10 p-value**: Only show colocalizations where the -log10 p-value of the association between the lead variant and the trait is greater than or equal to the provided value.
- **Colocalization PP(H4)**: Only show colocalizations where the posterior probability of H4 is greater than or equal to the provided value.
- **R2**: Only show colocalizations where the linkage disequilibrium (r2) between the two lead variants is greater than or equal to the provided value.

At the bottom of the filter panel are a set of toggles:

- **Color-code variants**: Turn on/off the coloring of variant IDs.
- **Show Ensembl IDs**: Add a column to the table showing Ensembl IDs. Standard ENSG IDs are given for genes. For exons, the ID may be either the standard ENSE ID, or a custom ID in the format `ENSG<ID>_start_end` where `ID` is the Ensembl gene ID, `start` is the start position of the exon, and `end` is the end position of the exon.
- **Show effect sizes**: Adds columns showing the effect sizes for the lead variants of the two traits. Both the marginal and conditional effect sizes are shown.
- **Show single signals**: Normally, the colocalization/search table will only show records where two signals colocalized, or at least were tested for colocalization. Often a study will provide a superset of signals that do not colocalize, or were not tested for colocalization, but may still be of interest when exploring a region. Turning this on will allow these signals to appear in the table.

Each row has an `Expand` button (green downward V) in the very leftmost column. Clicking on this button reveals a set of controls: 

<img src="help-images/coloc-table-row-controls.png" alt="search table row controls">

### MultiZoom Page

From any row in the colocalization/search table, click the expand button, then click the "MultiZoom" button.

<img src="help-images/multizoom-page.png" alt="multizoom page overview image">

The MultiZoom page allows you to plot any number of fine-mapped signals in a grid of your choosing. A pair of colocalized signals can be plotted, or simply select a number of fine-mapped signals to plot regardless of whether they have colocalized.

When navigating to the MultiZoom page from the search table, the colocalized signals from the row in the table are automatically added to cells A1 and A2 automatically.

To add new plots, navigate below to the table of nearby colocalized signals. In the `Add plots` column are two green boxes. The first box refers to the first signal, and the second box to the second signal. Clicking on one of the boxes will reveal controls that allow you to select where in the grid the plot should be added.

The "MultiZoom Tools" panel on the left hand side has various controls for the plots. Many are self explanatory, but here we describe those which are not: 

- **Export Plot Group**: This exports an image containing all of the plots within the grid.
- **Trim Grid**: Removes grid cells that have no plots contained in them.
- **Y axis**: Toggle betwen showing the fine-mapped/conditional analysis p-values, or the marginal association p-values without conditioning.

- **Add unique signals only**: When adding plots, if a signal has already been added, this will prevent it from being added twice.
- **Select theme**: Can be "Modern", "LocusZoom", or "Greyscale". The "LocusZoom" theme is the traditional theme most commonly seen. The "Modern" theme is an updated version of the LocusZoom theme, with transparency enabled for low LD variants, and a border around the lead variant as opposed to a purple diamond. Recombination peaks are often easier to see in the modern theme as well.

Clicking on a cell in the grid provides various options to add or remove additional cells, or to add a gene panel.

Clicking on row or column headers allows for adding entire rows or columns, or deleting them.

### LocusZoom Page

Clicking on any row in the table of colocalization results, or on the "LocusZoom" button in the row controls shown above, will bring you to the LocusZoom page:

<img src="help-images/locuszoom-page-example.png" alt="locuszoom page overview image">

This page initially highlights a single colocalization result. The two traits with colocalizing signals are shown at the top in text, along with the lead variants for each signal. For example:

> Colocalization of Type 2 diabetes (8_41508577_C_A) with ANK1 (8_41519248_T_C)

Following this are 3 plots:

- **LocusCompare plot**: We plot the -log10 conditional p-value for each variant in the two different traits. The conditional p-value is the p-value after having performed conditional analysis or fine-mapping. The x-axis is the -log10 p-value for the variant in one of the traits (listed in the axis label), and similarly for the y-axis. Each variant is colored by its LD with the reference variant, shown in purple.

  The reference variant is initially set to the lead variant of the conditional signal from the first shown trait in the LocusZoom plots. If the lead variant is not the same in both traits, the reference variant can be changed by using the controls below the LocusCompare plot.

- **LocusZoom plots**: On the right hand side are two LocusZoom plots, one for each trait. The -log10 p-values shown are also the conditional p-values after fine-mapping. The marginal p-values are also available before fine-mapping by using the radio buttons below the LocusCompare plot for changing the `y-axis` to `Marginal -log10p`. A separate panel beneath the two plots shows nearby genes.

Below the plots is a table showing all other known colocalized signals in the same region (where the region is defined as being within a 500kb window centered around the lead variants of the two colocalized signals.)

The table follows the same format as the colocalization results table on the search page, with an additional button on the left hand side under the `Add plots` column. Clicking this button will add two LocusZoom panels above, one for each trait's associated signals.

### Manhattan Plot Page

On the search page, click the expand button on any row in the table, then click the "Manhattan plot" link in the "View Local Page" column. The manhattan plot page looks like the following:

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
