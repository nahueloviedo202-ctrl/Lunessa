// product-info.js only refreshes Dawn's own elements, so the offer layout's
// variant-dependent markup (offers, stock, buy button label) is refreshed here.
subscribe(PUB_SUB_EVENTS.variantChange, ({ data: { sectionId, html } }) => {
  document.querySelectorAll(`#MainProduct-${sectionId} [data-poh-sync]`).forEach((element) => {
    const source = html.querySelector(`[data-poh-sync="${element.dataset.pohSync}"]`);
    if (source) element.innerHTML = source.innerHTML;
  });
});
