var authenticationRequest = {
    authenticationKey: 'D0553CA155C343C592CA87D29E6D1EA',
    backgroundInteraction: data => {
        const msg = data.details.message
        const responseType = CapptaCheckout.responseType
        const interactionType = CapptaCheckout.interactionType

        switch (data.responseType) {
            case responseType.SHOW_MESSAGE:
                updateResult(msg)
                break;

            case responseType.REQUEST_DATA:
                updateResult(msg)

                switch (data.details.interactionType) {
                    case interactionType.ASK_TWO_OPTIONS:
                    case interactionType.ASK_TWO_OPTIONS_WITH_TIMEOUT:
                    case interactionType.ASK_UNDO_OR_CONFIRM_PENDING_PAYMENTS:
                        confirm(msg)
                            ? data.next(1)
                            : data.next(0)
                        break

                    case interactionType.ASK_REVERSAL_PASSWORD:
                        // se o interactionType for 'ASK_REVERSAL_PASSWORD'
                        // poderia ser um campo mascarado aqui
                        var response = prompt(msg)
                        response
                            ? data.next(response)
                            : data.back()
                        break

                    default:
                        var response = prompt(msg)
                        response
                            ? data.next(response)
                            : data.back()
                        break
                }

                break;
        }
    }
};

var checkouts;

var onAuthenticationSuccess = function (response) {
    updateResult('Autenticado com sucesso' + '<br>' + 'Checkout GUID: ' + response.merchantCheckoutGuid);
    getCheckouts();
};

var onAuthenticationError = function (error) {
    updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
};

var onFoundPendingPaymentsOnLastMultiPaymentsSession = function (response) {
    console.log(response);
};

var checkout = CapptaCheckout.authenticate(authenticationRequest, onAuthenticationSuccess, onAuthenticationError, onFoundPendingPaymentsOnLastMultiPaymentsSession);

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
            toogleMultiplePaymentsElements(false);
        });

        multiplePaymentsSessionInProgress = true;
        toogleMultiplePaymentsElements(true);
    } catch (ex) {
        alert(ex);
    }
}

function toogleMultiplePaymentsElements(disabled) {
    document.getElementById('txtNumberOfPayments').disabled = disabled;
    document.getElementById('rbUseMultiplePayments').disabled = disabled;
    document.getElementById('rbNotUseMultiplePayments').disabled = disabled;
}

var onPaymentSuccess = function (response) {
    updateResult(response.receipt.merchantReceipt + '<br>' + response.receipt.customerReceipt);
};
var onPaymentError = function (error) {
    updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
};

function debitPayment() {
    if (canStartMultiplePaymentsSession()) {
        startMultiplePayments();
    }

    var amount = parseFloat(document.getElementById('txtDebitAmount').value.replace(',', ''));
    var requestKey = document.getElementById("txtDebitRequestKey").value;
    checkout.debitPayment({ amount: amount, requestKey }, onPaymentSuccess, onPaymentError);
}

function creditPayment() {
    if (canStartMultiplePaymentsSession()) {
        startMultiplePayments();
    }

    var installmentTypeElement = document.getElementById("installmentType");
    var installmentType = installmentTypeElement.options[installmentTypeElement.selectedIndex].value;

    var installments = document.getElementById('txtCreditInstallments').value;

    var creditRequest = {
        amount: parseFloat(document.getElementById('txtCreditAmount').value.replace(',', '')),
        requestKey: document.getElementById("txtCreditRequestKey").value,
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
        requestKey: document.getElementById("txtSplittedDebitRequestKey").value,
        installments: document.getElementById('txtSplittedDebitInstallments').value
    };

    checkout.splittedDebitPayment(splittedDebitRequest, onPaymentSuccess, onPaymentError);
}

function toogleInstallmentTypeElements(value) {
    if (value) {
        document.getElementById('installmentDetails').classList.add('show');
        return;
    }
    document.getElementById('installmentDetails').classList.remove('show');
}

function paymentReversal() {

    var paymentReversalRequest = {
        administrativePassword: document.getElementById('administrativePassword').value,
        administrativeCode: document.getElementById('administrativeCode').value,
        requestKey: document.getElementById("txtReversalRequestKey").value
    };

    CapptaCheckout.paymentReversal(paymentReversalRequest, onPaymentSuccess, onPaymentError);
}

function reprint() {
    var data = {
        administrativeCode: $("#AdministrativeCodeForReprint").val(),
        receiptType: $("#rbReprint > input:checked").val()
    }
    checkout.reprint(data, onPaymentSuccess, onPaymentError);
}

function resolvePendingTransaction() {
    var data = {
        administrativeCode: $('#resolvePendingAdministrativeCode').val()
    }

    const success = (response) => {
        updateResult(`Número de Controle: ${response.administrativeCode}<br>Resolvida: ${response.success ? "Sim" : "Não"}`);
    }

    if (parseInt($('#resolvePending input:checked').val()) == 1) {
        checkout.undoPendingPayment(data, success, onPaymentError)
    } else {
        checkout.confirmPendingPayment(data, success, onPaymentError);
    }
}

function reprintLast() {
    checkout.reprintLast(onPaymentSuccess, onPaymentError);
}

function getPaymentTransaction() {
    var data = { requestKey: $("#requestKey").val() }
    checkout.getPaymentByRequestKey(data, onPaymentSuccess, onPaymentError);
}

function pinpadInput() {
    var pinpadInputType = document.getElementById("pinpadInputType");
    var inputType = pinpadInputType.options[pinpadInputType.selectedIndex].value;

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