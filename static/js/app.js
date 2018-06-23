document.addEventListener("DOMContentLoaded", async () => {
    await updatePortfolio();
});

async function updatePortfolio() {
    // Get portfolio data
    let response = await fetch('/portfolio');
    let data = await response.json();

    // Sort by percents
    let percents = [];
    for (let asset in data.portfolio.assets) {
        percents.push([asset, data.portfolio.assets[asset].percent])
    }
    percents.sort(([,a], [,b]) => b - a);

    // Show total and portfolio id
    $('#portfolio_id').val(data.portfolio.user_id);
    $('#total').text(`${data.portfolio.total.toFixed(2)}€`);

    // Reset list and show assets ordered
    let $assets = $('#assets');
    $assets.empty();
    percents.forEach(([symbol,]) => {
        $assets.append(getAssetTemplate(
            symbol,
            Number.parseFloat(data.portfolio.assets[symbol].price).toFixed(2),
            Number.parseFloat(data.portfolio.assets[symbol].quantity).toFixed(2),
            Number.parseFloat(data.portfolio.assets[symbol].total).toFixed(2)
        ));
    });
}

function addAsset(symbol, quantity) {

}

function getAssetTemplate(symbol, price, quantity, total) {
    return `<li id="asset-${symbol}" class="list-group-item">
                <span class="text-left mr-10 symbol">${symbol}</span>
                <span class="text-right ml-10 price">${price}€</span>
                <span class="text-right ml-10 quantity">
                    <a id="qty-label-${symbol}" ref="${symbol}">${quantity}</a>
                    <input type="text" class="form-control qty-edit d-none" placeholder="Quantity" id="qty-input-${symbol}" value="${quantity}">
                </span>
                <span class="text-right ml-10 total">${total}€</span>
            </li>`;
}

function showAlert(message) {
    let $alert = $('#alert');
    $alert.text(message);
    $alert.addClass('in');
    window.setTimeout(() => {
        $alert.removeClass('in');
    }, 3000)
}
