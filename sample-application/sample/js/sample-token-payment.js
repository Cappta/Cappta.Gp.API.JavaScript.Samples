var authenticationRequest = {
    authenticationKey: '795180024C04479982560F61B3C2C06E' 
};

var onAuthenticationSuccess = function (response) {
    updateResult('Autenticado com sucesso' + '<br>' + 'Checkout GUID: ' + response.merchantCheckoutGuid);
};

var onAuthenticationError = function (error) {
    updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
};

var onPendingPayments = function (response) {
    console.log(response);
};

var updateResult = function (message) {
    document.getElementById('response').innerHTML = message;
}

var checkout = CapptaCheckout.authenticate(authenticationRequest, onAuthenticationSuccess, onAuthenticationError, onPendingPayments);

function creditPaymentAndCreateCardToken() {
    
        var elInstallmentType = document.getElementById("installmentType");
        var installmentType = elInstallmentType.options[elInstallmentType.selectedIndex].value;
    
        var installments = document.getElementById('txtCreditInstallments').value;

        var elDocumentType = document.getElementById("documentType");
        var documentType = elDocumentType.options[elDocumentType.selectedIndex].value;
    
        var request = {
            amount: parseFloat(document.getElementById('txtCreditAmount').value.replace(',', '')),
            installments: installments === '' ? 0 : installments,
            installmentType: installmentType,
            customer: {
                name: document.getElementById('txtCustomerName').value,
                document: document.getElementById('txtCustomerDocument').value,
                documentType: documentType,
                email: document.getElementById('txtCustomerEmail').value
            }
        };

        var success = function(response) {
            console.log(response.cardTokenDetails.cardToken)
            var cardToken = 'Token Mundipagg do cartão de crédito:<br><b>' 
                            + 'CardToken: ' + response.cardTokenDetails.cardToken + '</b><br>'
                            + 'Bandeira: ' + response.cardTokenDetails.cardBrandName + '<br>'
                            + 'Ultimos 4 digitos: ' + response.cardTokenDetails.lastFourDigits + '<br>'
                            + 'Expira em: ' + response.cardTokenDetails.expMonth + '/' + response.cardTokenDetails.expYear + '<br>'                              
                            + 'CustomerId: ' + response.cardTokenDetails.customer.customerId + '<br>'
                            + 'Documento: ' + response.cardTokenDetails.customer.document + '<br>'
                            + 'Nome: ' + response.cardTokenDetails.customer.name + '<br>'
                            + 'Email: ' + response.cardTokenDetails.customer.email + '<br>';
            updateResult(cardToken + '<br>' + response.receipt.merchantReceipt + '<br>' + response.receipt.customerReceipt);
        };

        var error = function(err) {
            updateResult('Código: ' + err.reasonCode + '<br>' + err.reason);
        };
    
        checkout.creditPaymentAndCreateCardToken(request, success, error);
}

function createCardToken() {
    
    var elDocumentType = document.getElementById("documentTypeTokenCreation");
    var documentType = elDocumentType.options[elDocumentType.selectedIndex].value;

     var request = {
            customer: {
                name: document.getElementById('txtCustomerNameTokenCreation').value,
                document: document.getElementById('txtCustomerDocumentTokenCreation').value,
                documentType: documentType,
                email: document.getElementById('txtCustomerEmailTokenCreation').value
            }
        };

        var success = function(response) {
            var cardToken = 'Token Mundipagg do cartão de crédito:<br><b>' 
                                + 'CardToken: ' + response.cardToken + '</b><br>'
                                + 'Bandeira: ' + response.cardBrandName + '<br>'
                                + 'Ultimos 4 digitos: ' + response.lastFourDigits + '<br>'
                                + 'Expira em: ' + response.expMonth + '/' + response.expYear + '<br>'                              
                                + 'CustomerId: ' + response.customer.customerId + '<br>'
                                + 'Documento: ' + response.customer.document + '<br>'
                                + 'Nome: ' + response.customer.name + '<br>'
                                + 'Email: ' + response.customer.email + '<br>';
            updateResult(cardToken);
        };

        var error = function(err) {
            updateResult('Código: ' + err.reasonCode + '<br>' + err.reason);
        };
    
        checkout.createCardToken(request, success, error);
}

function paymentWithToken() {

    var hasInstallments = document.querySelector('input[name="opInstallmentTypeWithToken"]:checked').value;

    var installments = document.getElementById('txtTokenCreditInstallments').value;

    var request = {
        amount: document.getElementById("txtTokenAmount").value,
        installments: installments === '' ? 0 : installments,
        installmentType: hasInstallments === 'true',
        cardToken: document.getElementById("txtCardToken").value,
        orderReference: document.getElementById("txtOrderReference").value,
        customer: {
            externalId: document.getElementById('txtCustomerId').value
        }
    };

    var success = function(response) {
        console.log(response);
        
        var message = '<b>Pagamento realizado com sucesso.</b><br>';
        message += 'Identificação do pagamento: ' + response.payment_key + '<br>';
        message += 'Adquirente: ' + response.acquirer_name + '<br>';
        message += 'Bandeira: ' + response.card_brand_name + '<br>';
        message += 'Status: ' + response.status + '<br>';
        message += 'Valor em centavos: ' + response.amount + '<br>';

        updateResult(message);
    };

    var error = function(err) {
        updateResult('Código: ' + err.reasonCode + '<br>' + err.reason);
    };

    checkout.paymentWithToken(request, success, error);
};

function cancelTokenPayment() {

    var request = {
        paymentKey: document.getElementById("txtCancelTokenPayment").value
    };

    var success = function(response) {
        console.log(response);
        
        var message = '<b>Pagamento cancelado com sucesso.</b><br>';
        message += 'Identificação do pagamento: ' + response.payment_key + '<br>';
        message += 'Adquirente: ' + response.acquirer_name + '<br>';
        message += 'Bandeira: ' + response.card_brand_name + '<br>';
        message += 'Status: ' + response.status + '<br>';
        message += 'Valor em centavos: ' + response.amount + '<br>';

        updateResult(message);
    };

    var error = function(err) {
        updateResult('Código: ' + err.reasonCode + '<br>' + err.reason);
    };

    checkout.cancelTokenPayment(request, success, error);
}

function onSelectInstallmentType(value) {
    if (value) {
        document.getElementById('installmentDetails').classList.add('show');
        return;
    }
    document.getElementById('installmentDetails').classList.remove('show');
}

onSelectPaymentWithTokenInstallmentType
function onSelectPaymentWithTokenInstallmentType(value) {
    if (value) {
        document.getElementById('paymentWithTokenInstallmentDetails').classList.add('show');
        return;
    }
    document.getElementById('paymentWithTokenInstallmentDetails').classList.remove('show');
}

$(function () {
    $('#txtCreditAmount').maskMoney();
    $('#txtTokenAmount').maskMoney();
});

