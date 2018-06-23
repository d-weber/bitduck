document.addEventListener("DOMContentLoaded", async () => {
    await updatePortfolio();
});

async function updatePortfolio() {
    // Get portfolio data
    let response = await fetch('/portfolio',{credentials: 'same-origin'});
    let data = await response.json();

    // Sort by percents
    let percents = [];
    for (let asset in data.portfolio.assets) {
        percents.push([asset, data.portfolio.assets[asset].percent])
    }
    percents.sort(([,a], [,b]) => b - a);

    // Show total and portfolio id
    $('#portfolio_id').val(data.portfolio.user_id);
    changeNumber($('#total'), data.portfolio.total, '€');

    // Reset list and show assets ordered
    let $assets = $('#assets');
    $('#assets .loading').remove();
    percents.forEach(async ([symbol,]) => {
        let $asset = $(`#asset-${symbol}`);
        if ($asset.length) {
            changeNumber($asset.children('.price'), data.portfolio.assets[symbol].price, '€');
            changeNumber($asset.children('.quantity'), data.portfolio.assets[symbol].quantity);
            changeNumber($asset.children('.total'), data.portfolio.assets[symbol].total, '€');
        } else {
            $assets.append(getAssetTemplate(
                symbol,
                numberFormat(data.portfolio.assets[symbol].price),
                numberFormat(data.portfolio.assets[symbol].quantity),
                numberFormat(data.portfolio.assets[symbol].total)
            ));
        }
    });

    setTimeout(await updatePortfolio, 9000 + Math.floor(Math.random() * Math.floor(1000)));
}

function changeNumber(selector, value, suffix = '') {
    let old_value = numberFormat(selector.text());
    let new_value = numberFormat(value);
    let delta = new_value - old_value;

    if (delta !== 0) {
        selector.text(`${new_value}${suffix}`);
        let color = delta > 0 ? 'green' : 'red';
        selector.addClass(`blink_${color}` ).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function(){
            selector.removeClass(`blink_${color}`);
        });
    }
}

function numberFormat(number) {
    number = Number.parseFloat(number);

    if (number >= 1) {
        return number.toFixed(2);
    }

    return number.toPrecision(3);
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

async function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
