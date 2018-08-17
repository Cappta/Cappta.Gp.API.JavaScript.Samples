var authenticationRequest = {
    authenticationKey: '795180024C04479982560F61B3C2C06E'
};

var onAuthenticationSuccess = function(response) {
    updateResult('Autenticado com sucesso' + '<br>' + 'Checkout GUID: ' + response.merchantCheckoutGuid);
};

var onAuthenticationError = function(error) {
    updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
};

var onPendingPayments = function(response) {
    console.log(response);
};

var checkout = CapptaCheckout.authenticate(authenticationRequest, onAuthenticationSuccess, onAuthenticationError, onPendingPayments);

var plan_items = [],
    subcriptions_discounts = [];

function getErrors(errors) {
    if (errors === undefined || errors.length === 0) { return ""; }
    return errors.map(unpackErrors).join("\n");
}

function unpackErrors(error) {
    var message = error.message;
    if (message === null || message === "") { return; }
    return error.message;
}

function createPlan() {

    var el = document.getElementById("plan_interval");
    var plan_interval = el.options[el.selectedIndex].value;

    var request = {
        name: document.getElementById('plan_name').value,
        description: document.getElementById('plan_description').value,
        statement_descriptor: document.getElementById('plan_statement_descriptor').value,
        cycles: document.getElementById('plan_cycles').value,
        interval: plan_interval,
        interval_count: document.getElementById('plan_interval_count').value,
        trial_period_days: document.getElementById('plan_trial_period_days').value,
        items: plan_items
    };

    var success = function(response) {
        updateResult('Plano criado com sucesso!');
        console.log(response);
    };
    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason + getErrors(error.errors));
    };
    checkout.createPlan(request, success, error);
}

function getPlanById(plan_id) {

    var success = function(response) {

        var message = 'ID do plano: ' + response.id + '<br>';
        message += 'Nome: ' + response.name + '<br>';
        message += 'Descrição: ' + response.description + '<br>';
        message += 'Status: ' + response.status + '<br>';
        message += 'Data de criação: ' + response.created_at + '<br>';

        updateResult(message);
        console.log(response);
    };
    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.getPlanById({ plan_id: plan_id }, success, error);
}

function getPlans() {

    var success = function(response) {
        $('#plan_list_result').empty();
        $('#plan_table').removeClass('hidden');

        console.log($('#plan_list_result'))
        console.log($('#plan_list_template'))
        var template = $('#plan_list_template').html();
        response.map(function(plan) {
            $('#plan_list_result').append(Mustache.to_html(template, plan));
        });

        updateResult('Planos obtidos com sucesso! Total: ' + response.length);
        console.log(response);
    };
    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.getPlans(success, error);
}

function deletePlan(plan_id) {
    var success = function(response) {

        alert('Plano excluido com sucesso!');
        console.log(response);
        getPlans();
    };

    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.deletePlan({ plan_id: plan_id }, success, error);
}

function addPlanItem() {
    var item = {
        name: document.getElementById('plan_item_name').value,
        description: document.getElementById('plan_item_description').value,
        quantity: document.getElementById('plan_item_quantity').value,
        cycles: document.getElementById('plan_item_cycles').value,
        price: document.getElementById('plan_item_price').value
    };
    plan_items.push(item);
    listPlanItems();
}

function removePlanItem(id) {
    plan_items.splice(0, 1);
    listPlanItems();
}

function listPlanItems() {
    $('#result_plans_itens').empty();

    var template = $('#plans_itens_template').html();
    plan_items.map(function(item) {
        $('#result_plans_itens').append(Mustache.to_html(template, item));
    });
}

function getElementValueOrDefaultValue(elementId) {
    var elementValue = document.getElementById(elementId).value;
    return elementValue === "" ? null : elementValue;
}

function createSubscription() {
    var request = {
        plan_id: document.getElementById('subscription_plan_id').value,
        start_at: document.getElementById('subscription_customer_start_at').value,
        customer: {
            name: document.getElementById('subscription_customer_name').value,
            email: document.getElementById('subscription_customer_email').value
        }
    };

    var success = function(response) {
        var message = 'ID da assinatura: ' + response.id + '<br>';
        message += 'Status: ' + response.status + '<br>';
        message += 'Data de criação: ' + response.created_at + '<br>';
        message += response.receipt.merchant + '<br><br>' + response.receipt.customer;

        updateResult(message);
        console.log(response);
    };

    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason + getErrors(error.errors));
    };

    checkout.createSubscription(request, success, error);
}

function getSubscriptionById(subscription_id) {

    var success = function(response) {

        var message = 'ID da assinatura: ' + response.id + '<br>';
        message += 'Status: ' + response.status + '<br>';
        message += 'Data de criação: ' + response.created_at + '<br>';
        message += response.receipt.merchant + '<br><br>' + response.receipt.customer;

        updateResult(message);
        console.log(response);
    };

    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.getSubscriptionById({ subscription_id: subscription_id }, success, error);
}

function getSubscriptions() {

    var success = function(response) {
        $('#subscription_list_result').empty();
        $('#subscription_table').removeClass('hidden');

        var template = $('#subscription_list_template').html();
        response.map(function(subscription) {
            $('#subscription_list_result').append(Mustache.to_html(template, subscription));
        });

        updateResult('Assinaturas obtidas com sucesso! Total: ' + response.length);
        console.log(response);
    };

    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.getSubscriptions(success, error);
}

function cancelSubscription(subscription_id) {

    var request = {
        subscription_id: subscription_id,
        cancel_pending_invoices: false
    };

    var success = function(response) {
        alert('Assinatura cancelada com sucesso!');
        listSubscriptions();
        console.log(response);
    };

    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };


    checkout.cancelSubscription(request, success, error);
}

function updateSubscriptionCard(subscription_id) {

    var request = {
        subscription_id: subscription_id,
        credit_card: {},
    };

    var success = function(response) {
        updateResult('Cartão atualizado com sucesso!');
        console.log(response);
    };
    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.updateSubscriptionCard(request, success, error);
}

function updateSubscriptionBillingDate() {
    var request = {
        subscription_id: document.getElementById('subscription_id').value,
        next_billing_date: document.getElementById('subscription_next_billing_date').value
    };

    var success = function(response) {
        updateResult('Data da próxima cobrança atualizada com sucesso!');
        console.log(response);
    };

    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.updateSubscriptionBillingDate(request, success, error);
}

function createSubscriptionDiscount() {
    var request = {
        subscription_id: document.getElementById('subscription_id').value,
        value: document.getElementById('discount_value').value,
        cycles: document.getElementById('discount_cycles').value,
        discount_type: $('input[name="discount_type"]:checked').val()
    };

    var success = function(response) {
        updateResult('Desconto criado com sucesso!');
        console.log(response);
    };
    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.createSubscriptionDiscount(request, success, error);
};

function removeSubscriptionDiscount(discount_id) {

    var request = {
        subscription_id: document.getElementById('discount_list_subscription_id').value,
        discount_id: discount_id
    };

    var success = function(response) {
        updateResult('Desconto removido com sucesso!');
        console.log(response);
    };
    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.removeSubscriptionDiscount(request, success, error);
};

function createSubscriptionItem() {
    var request = {
        subscription_id: document.getElementById('subscription_id').value,
        value: document.getElementById('subscription_item_value').value,
        cycles: document.getElementById('subscription_item_cycles').value,
        description: document.getElementById('subscription_item_description').value
    };

    var success = function(response) {
        updateResult('Item criado com sucesso!');
        console.log(response);
    };
    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason + '<br>' + getErrors(error.errors));
    };

    checkout.createSubscriptionItem(request, success, error);
};

function removeSubscriptionItem(item_id) {
    var request = {
        subscription_id: document.getElementById('item_list_subscription_id').value,
        item_id: item_id
    };

    var success = function(response) {
        updateResult('Desconto removido com sucesso!');
        console.log(response);
    };
    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.removeSubscriptionItem(request, success, error);
};

function getInvoices() {

    var success = function(response) {
        $('#invoice_list_result').empty();
        $('#invoice_table').removeClass('hidden');

        var template = $('#invoice_list_template').html();
        response.map(function(invoice) {
            $('#invoice_list_result').append(Mustache.to_html(template, invoice));
        });

        updateResult('Faturas obtidas com sucesso! Total: ' + response.length);
    };

    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.getInvoices(success, error);
};

function getInvoiceById(invoice_id) {

    var success = function(response) {

        var message = 'ID da assinatura: ' + response.id + '<br>';
        message += 'Valor em centavos: ' + response.amount + '<br>';
        message += 'Status: ' + response.status + '<br>';
        message += 'Data de criação: ' + response.created_at + '<br>';

        updateResult(message);
        console.log(response);
    };

    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.getInvoiceById({ invoice_id: invoice_id }, success, error);
};

function cancelInvoice(invoice_id) {

    var success = function(response) {
        updateResult('Fatura estornada com sucesso!');
        console.log(response);
    };

    var error = function(error) {
        updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
    };

    checkout.cancelInvoice({ invoice_id: invoice_id }, success, error);
};

function updateResult(message) {
    document.getElementById('response').innerHTML = message;
}

$(document).ready(function() {

    $(document).on('click', '#button_updateSubscriptionCard', function() {
        var id = $(this).data('id');
        $('#billing_address_modal').on('shown.bs.modal', function() {
            $(this).off('shown.bs.modal');
            $('#subscription_id').val(id);
        });
    });

    $(document).on('click', '#button_updateSubscriptionBillingDate', function() {
        var id = $(this).data('id');
        $('#billing_date_modal').on('shown.bs.modal', function() {
            $(this).off('shown.bs.modal');
            $('#subscription_id').val(id);
        });
    });

    $(document).on('click', '#button_listSubscriptionDiscounts', function() {
        var id = $(this).data('id');
        $('#discount_list_modal').on('shown.bs.modal', function() {
            $(this).off('shown.bs.modal');
            $('#discount_list_subscription_id').val(id);

            var success = function(response) {
                $('#discount_list_result').empty();

                var template = $('#discount_list_template').html();
                response.discounts.map(function(discount) {
                    $('#discount_list_result').append(Mustache.to_html(template, discount));
                });

                console.log(response);
            };

            var error = function(error) {
                updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
            };

            checkout.getSubscriptionById({ subscription_id: id }, success, error);
        });
    });

    $(document).on('click', '#button_createSubscriptionDiscount', function() {
        var id = $(this).data('id');
        $('#discount_modal').on('shown.bs.modal', function() {
            $(this).off('shown.bs.modal');
            $('#subscription_id').val(id);
        });
    });

    $(document).on('click', '#button_listSubscriptionItems', function() {
        var id = $(this).data('id');
        $('#item_list_modal').on('shown.bs.modal', function() {
            $(this).off('shown.bs.modal');
            $('#item_list_subscription_id').val(id);

            var success = function(response) {
                $('#items_list_result').empty();

                var template = $('#items_list_template').html();
                response.items.map(function(item) {
                    $('#items_list_result').append(Mustache.to_html(template, item));
                });
            };
            var error = function(error) {
                updateResult('Código: ' + error.reasonCode + '<br>' + error.reason);
            };

            checkout.getSubscriptionById({ subscription_id: id }, success, error);
        });
    });

    $(document).on('click', '#button_createSubscriptionItems', function() {
        var id = $(this).data('id');
        $('#item_modal').on('shown.bs.modal', function() {
            $(this).off('shown.bs.modal');
            $('#subscription_id').val(id);
        });
    });
});

var SampleRecurrency = (function() {

    return {
        createPlan,
        getPlans,
        getPlanById,
        deletePlan,

        createSubscription,
        getSubscriptions,
        getSubscriptionById,
        cancelSubscription,

        createSubscriptionDiscount,
        removeSubscriptionDiscount,

        createSubscriptionItem,
        removeSubscriptionItem,

        updateSubscriptionCard,
        updateSubscriptionBillingDate,

        getInvoices,
        getInvoiceById,
        cancelInvoice
    };

})();