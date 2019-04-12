var authenticationRequest = {
    authenticationKey: 'D0553CA155C343C592CA87D29E6D1EA'

};

var checkouts;

var onAuthenticationSuccess = function (response) {
    updateResult('Autenticado com sucesso' + '<br>' + 'Checkout GUID: ' + response.merchantCheckoutGuid);
    getCheckouts();
};

var onAuthenticationError = function (error) {
    updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
};

var onPendingPayments = function (response) {
    console.log(response);
};

var checkout = CapptaCheckout.authenticate(authenticationRequest, onAuthenticationSuccess, onAuthenticationError, onPendingPayments);

var multiplePaymentsSessionInProgress = false;

function canStartMultiplePaymentsSession() {
    return multiplePaymentsSessionInProgress === false && $('input[name="rbMultiplePayments"]:checked').val() === 'true';
}

function startMultiplePayments() {
    try {
        var numberOfPayments = parseInt(document.getElementById('txtNumberOfPayments').value);

        checkout.startMultiplePayments(numberOfPayments, function () {
            alert('Sessão multiplos pagamentos encerrada!');
            document.getElementById('txtNumberOfPayments').value = 0;
            handlerMultiplePaymentsElements(false);

        });

        multiplePaymentsSessionInProgress = true;
        handlerMultiplePaymentsElements(true);
    } catch (ex) {
        alert(ex);
    }
}

function handlerMultiplePaymentsElements(disabled) {
    document.getElementById('txtNumberOfPayments').disabled = disabled;
    document.getElementById('rbUseMultiplePayments').disabled = disabled;
    document.getElementById('rbNotUseMultiplePayments').disabled = disabled;
}

var onPaymentSuccess = function (response) {
    updateResult(response.receipt.merchantReceipt + '<br>' + response.receipt.customerReceipt);
    console.log(response )
};
var onPaymentError = function (error) {
    updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
};

function debitPayment() {
    if (canStartMultiplePaymentsSession()) {
        startMultiplePayments();
    }

    var amount = parseFloat(document.getElementById('txtDebitAmount').value.replace(',', ''));
    checkout.debitPayment({ amount: amount }, onPaymentSuccess, onPaymentError);
}

function creditPayment() {
    if (canStartMultiplePaymentsSession()) {
        startMultiplePayments();
    }

    var elInstallmentType = document.getElementById("installmentType");
    var installmentType = elInstallmentType.options[elInstallmentType.selectedIndex].value;

    var installments = document.getElementById('txtCreditInstallments').value;

    var creditRequest = {
        amount: parseFloat(document.getElementById('txtCreditAmount').value.replace(',', '')),
        installments: installments === '' ? 0 : installments,
        installmentType: installmentType
    };

    checkout.creditPayment(creditRequest, onPaymentSuccess, onPaymentError);
}

function splittedDebitPayment() {
    if (canStartMultiplePaymentsSession()) {
        startMultiplePayments();
    }

    var splittedDebitRequest = {
        amount: parseFloat(document.getElementById('txtSplittedDebitAmount').value.replace(',', '')),
        installments: document.getElementById('txtSplittedDebitInstallments').value
    };

    checkout.splittedDebitPayment(splittedDebitRequest, onPaymentSuccess, onPaymentError);
}

function selectInstallmentType(value) {
    if (value) {
        document.getElementById('installmentDetails').classList.add('show');
        return;
    }
    document.getElementById('installmentDetails').classList.remove('show');
}

function paymentReversal() {

    var paymentReversalRequest = {
        administrativePassword: document.getElementById('administrativePassword').value,
        administrativeCode: document.getElementById('administrativeCode').value
    };

    CapptaCheckout.paymentReversal(paymentReversalRequest, onPaymentSuccess, onPaymentError);
}

function pinpadInput() {
    var elInputType = document.getElementById("pinpadInputType");
    var inputType = elInputType.options[elInputType.selectedIndex].value;

    var success = function (response) {
        updateResult(response.pinpadValue);
    };

    var error = function (response) {
        updateResult(response.reason);
    };

    checkout.getPinpadInformation({ inputType: inputType }, success, error);
}

function confirmPayments() {
    multiplePaymentsSessionInProgress = false;

    checkout.confirmPayments();

    alert('Pagamentos confirmados com sucesso!');
}

function undoPayments() {
    multiplePaymentsSessionInProgress = false;

    checkout.undoPayments();

    alert('Pagamentos desfeitos com sucesso!');
}

function updateResult(message) {
    document.getElementById('response').innerHTML = message;
}

function getCheckouts() {
    var success = function (response) {
        var combo = document.getElementById("checkoutList");
        combo.innerHTML = null;

        checkouts = response.checkouts;

        response.checkouts.map(function (checkout) {
            var option = document.createElement("option");
            option.text = checkout.MerchantCnpj;
            option.value = checkout.MerchantCnpj;
            combo.add(option, null);
        });

        var cnpj = document.getElementById("checkoutList").value;
        if (cnpj !== null) {
            updateCheckoutInfo(cnpj);
        }

    };

    var error = function (response) {
        updateResult(response.reason);
    };

    checkout.getCheckouts(success, error);
}

function setCheckout() {
    var success = function (response, cnpj) {
        updateResult("PDV ativado com sucesso");
        updateCheckoutInfo(cnpj);
    };

    var error = function (response) {
        console.log(response);
        updateResult(response.reason);
    };

    var cnpj = document.getElementById("checkoutList").value;
    checkout.setCheckout(cnpj, success, error);
}

function updateCheckoutInfo(cnpj) {
    var info = document.getElementById("active-checkout");
    var checkout = getActivatedCheckout(checkouts, cnpj);
    info.innerHTML = "Estabelecimento: " + checkout.TradingName + "<br>CNPJ: " + checkout.MerchantCnpj + "<br>PDV: " + checkout.CheckoutNumber;
}

function getActivatedCheckout(checkouts, cnpj) {
    return checkouts.find(function (item) {
        return item.MerchantCnpj === cnpj;
    });
}

$(function () {

    $('#rbUseMultiplePayments').prop('checked', false);
    $('#rbNotUseMultiplePayments').prop('checked', true);

    $('#txtDebitAmount').maskMoney();
    $('#txtCreditAmount').maskMoney();
    $('#txtSplittedDebitAmount').maskMoney();

    $('input[name=rbMultiplePayments]').change(function () {
        var isMultiplePayments = this.value === 'true' ? true : false;

        if (isMultiplePayments) {
            document.getElementById('txtNumberOfPayments').classList.remove('hide');
            document.getElementById('multiplePaymentsButtons').classList.remove('hide');
            return;
        }

        document.getElementById('txtNumberOfPayments').classList.add('hide');
        document.getElementById('multiplePaymentsButtons').classList.add('hide');
        multiplePaymentsSessionInProgress = false;
    });
});