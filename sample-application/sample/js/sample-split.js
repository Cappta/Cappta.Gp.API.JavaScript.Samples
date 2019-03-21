var authenticationRequest = {
    authenticationKey: '795180024C04479982560F61B3C2C06E',
    merchantCnpj: '08476665000188',
    checkoutNumber: 1
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

var checkout = CapptaCheckout.authenticate(authenticationRequest, onAuthenticationSuccess, onAuthenticationError, onPendingPayments);

var split_recipients = [];

function getErrors(errors) {
    if (errors === null || errors.length === 0) { return ""; }
    return errors.map(unpackErrors).join('');
};

function unpackErrors(error) {
    var message = error.message;
    if (message === null || message === "") { return; }
    return '<br>- ' + error.message;
};

function createSplit() {

    var fee_liability_el = document.getElementById("fee_liability");
    var fee_liability_value = fee_liability_el.options[fee_liability_el.selectedIndex].value;
    
    var amount_split_mode_el = document.getElementById("amount_split_mode");
    var amount_split_mode_value = amount_split_mode_el.options[amount_split_mode_el.selectedIndex].value;

    var request = {
        administrative_code: document.getElementById('administrative_code').value,
        due_date: document.getElementById('due_date').value,
        amount_split_mode: amount_split_mode_value,
        fee_liability: fee_liability_value,
        splits: split_recipients
    };

    var success = function (response) {
        updateResult('Split criado com sucesso!');
    };

    var error = function (error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason + getErrors(error.errors));
    };
    checkout.createSplit(request, success, error);
}

function addSplitRecipient() {
    
    var recipient = {
        recipient_key: document.getElementById('split_recipient_key').value,
        amount: parseFloat(document.getElementById('split_recipient_amount').value.replace(',', ''))
    };

    document.getElementById('split_recipient_key').value = "";
    document.getElementById('split_recipient_amount').value = "";

    split_recipients.push(recipient);
    listSplitRecipients();
}

function listSplitRecipients() {
    $('#result_split_recipients').empty();

    var template = $('#split_recipients_template').html();
    split_recipients.map(function (recipient) {
        $('#result_split_recipients').append(Mustache.to_html(template, recipient));
    });
}

function getElementValueOrDefaultValue(elementId) {
    var elementValue = document.getElementById(elementId).value;
    return  elementValue === "" ? null : elementValue;
}

function updateResult(message) {
    document.getElementById('response').innerHTML = message;
}

$(document).ready(function () {
    
    $(document).on('click', '#button_createSplit', function () {
        $('#split_modal').on('shown.bs.modal', function () {
            $('#split_recipient_amount').maskMoney();
        });
    });
});

function getSplits() {
    
    var success = function (response) {
        
        $('#split_list_result').empty();
        $('#split_table').removeClass('hidden');

        var template = $('#split_list_template').html();
        response.map(function (split) {
            $('#split_list_result').append(Mustache.to_html(template, split));
        });

        updateResult('Splits obtidos com sucesso! Total: ' + response.length);
    };

    var error = function (error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.getSplits(success, error);
};

function getSplitById(split_key) {
    
    var success = function (response) {        
        var message = 'Split Key: ' + response.split_key + '<br>';
        message += 'Código administrativo: ' + response.administrative_code + '<br>';
        message += 'Modo de distribuição das taxas da transação: ' + response.fee_liability + '<br>';
        message += 'Valor informado em: ' + response.amount_split_mode + '<br>';
        message += 'Data de execução: ' + response.due_date + '<br>';
        message += 'Status: ' + response.status + '<br><br>';

        message += 'Recebedores:<br>';
        response.recipients.map(function(recipient) {
            message += 'Recipient Key: '+ recipient.recipient_key + ' Valor: ' + recipient.amount + '<br>';
        });

        updateResult(message);
    };
    var error = function (error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason + getErrors(error.errors));
    };

    checkout.getSplitById({split_key: split_key}, success, error);
};

function cancelSplit(split_key) {
    
    var success = function (response) {
        updateResult('Split cancelado com sucesso!');
    };
    var error = function (error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.cancelSplit({split_key: split_key}, success, error);
};

function createRecipient() {

    var request = {
        company_name: document.getElementById('company_name').value,
        document_type: document.getElementById('document_type').value,
        document_number: document.getElementById('document_number').value,
        bank_account: {
            bank_id: document.getElementById('bank_id').value,
            account_number: document.getElementById('account_number').value,
            account_number_digit: document.getElementById('account_number_digit').value,
            branch_code: document.getElementById('branch_code').value,
            branch_code_digit: document.getElementById('branch_code_digit').value
        },
        contact: {
            contact_name: document.getElementById('contact_name').value,
            email: document.getElementById('email').value,
            phone_number: document.getElementById('phone_number').value,
            mobile_phone_number: document.getElementById('mobile_phone_number').value
        }
    };

    var success = function (response) {
        updateResult('Recebedor credenciado com sucesso!');
        console.log(response);
    };
    var error = function (error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason + getErrors(error.errors));
    };

    checkout.createRecipient(request, success, error);
};

function getRecipients() {
    
    var success = function (response) {
        console.log(response);
        $('#recipient_list_result').empty();
        $('#recipient_table').removeClass('hidden');

        var template = $('#recipient_list_template').html();
        response.map(function (recipient) {
            $('#recipient_list_result').append(Mustache.to_html(template, recipient));
        });

        updateResult('Recebedores obtidos com sucesso! Total: ' + response.length);
    };

    var error = function (error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.getRecipients(success, error);
};

function getRecipientById(recipient_key) {
    
    var success = function (response) {
        console.log(response);

        var message = 'Recipient Key: ' + response.recipient_key + '<br>';
        message += 'Razão social: ' + response.company_name + '<br>';
        message += 'Tipo do documento: ' + response.document_type + '<br>';
        message += 'Número do documento: ' + response.document_number + '<br>';
        message += 'Status: ' + response.status + '<br><br>';
        
        message += 'Dados de contato<br>';
        message += 'Nome: ' + response.contact.contact_name + '<br>';
        message += 'E-mail: ' + response.contact.email + '<br>';
        message += 'Telefone: ' + response.contact.phone_number + '<br>';
        message += 'Celular: ' + response.contact.mobile_phone_number + '<br><br>';
        
        message += 'Dados bancários<br>';
        message += 'Código do banco: ' + response.bank_account.bank_id + '<br>';
        message += 'Número da agência: ' + response.bank_account.branch_code + '<br>';
        message += 'Dígito da agência: ' + response.bank_account.branch_code_digit + '<br>';
        message += 'Número da conta: ' + response.bank_account.account_number + '<br>';
        message += 'Dígito da conta: ' + response.bank_account.account_number_digit + '<br>';

        updateResult(message);
    };
    var error = function (error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason + getErrors(error.errors));
    };

    checkout.getRecipientById({recipient_key: recipient_key}, success, error);
};

function disableRecipient(recipient_key) {
    
    var success = function (response) {
        console.log(response);
        updateResult('Recebedor desabilitado com sucesso!');
    };
    var error = function (error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.disableRecipient({recipient_key: recipient_key}, success, error);
};

var SampleSplit = (function () {
    
    return {
        createSplit,
        getSplits,
        getSplitById,
        cancelSplit,
        createRecipient,
        getRecipients,
        getRecipientById,
        disableRecipient
    };

})();