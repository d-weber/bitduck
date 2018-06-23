document.addEventListener("DOMContentLoaded", async () => {
    await updatePortfolio();
});

async function updatePortfolio() {
    let response = await fetch('/portfolio');
    let data = await response.json();

    $('#portfolio_id').val(data.portfolio.user_id);
    $('#total').text(`${data.portfolio.total.toFixed(2)}€`);

    let $assets = $('#assets');
    $assets.empty();
    for (let asset in data.portfolio.assets) {
        if (data.portfolio.assets.hasOwnProperty(asset)) {
            $assets.append(getAssetTemplate(
                asset,
                Number.parseFloat(data.portfolio.assets[asset].price).toFixed(2),
                Number.parseFloat(data.portfolio.assets[asset].quantity).toFixed(2),
                Number.parseFloat(data.portfolio.assets[asset].total).toFixed(2)
            ));
        }
    }
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
