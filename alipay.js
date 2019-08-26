/**
 * Created by ference on 2017/4/8.
 */

var fs = require('fs');
var path = require('path');
var utl = require('./utl');

var alipay_gate_way = 'https://openapi.alipay.com/gateway.do';
var alipay_gate_way_sandbox = 'https://openapi.alipaydev.com/gateway.do';

/**
 *
 * @param {Object} opts
 * @param {String} opts.appId  支付宝的appId
 * @param {String} opts.notifyUrl  支付宝服务器主动通知商户服务器里指定的页面http/https路径
 * @param {String} opts.rsaPrivate  商户私钥pem文件路径
 * @param {String} opts.rsaPublic  支付宝公钥pem文件路径
 * @param {String} opts.signType   签名方式, 'RSA' or 'RSA2'
 * @param {Boolean} [opts.sandbox] 是否是沙盒环境
 * @constructor
 */
function Alipay(opts) {
    this.appId = opts.appId;
    this.sandbox = !!opts.sandbox;
    this.notifyUrl = opts.notifyUrl;
    this.signType = opts.signType;

    this.rsaPrivate = fs.readFileSync(opts.rsaPrivate, 'utf-8');
    // this.rsaPrivate = '-----BEGIN RSA PRIVATE KEY-----\r\nMIIEpAIBAAKCAQEAxhPGq/64Iq29SVHBUzP40BZT5ab8zMLREtoUZwjg/DuRblu2vu6aqDGqKsFQi4M2o7YDjHMRaSO2TAJ6KLRCV0ytwsBoO9Pvfx+kg0uqGE4PW0mQ8NM07JrTcDu1AIipPogOhvlik2ji/FhMntMxaXleqG15u8tv0vl1QvKBws/LNzqpPUXAP5fhGPDr/JmApd3L2LMmujWcevoshKLAuLFQuRoSUxIEaVSWzbRVUKDiiVv1QoaJgBqrzVXTLJf+jYvTXzaQHw70F7/CWA6WKzrz5RxVztmM4y0k6DeNLkfsobDlX+yHL5u3QWsWXqRQbB026umFSYK5Ss+cPp/X1wIDAQABAoIBAHw81zX2FGSb+MfOIaYgSQWrm3/F13ZPE3fxlS5zITrT2goQOHVVj2fDjuo2SmDXMiRI+7zSR69cmPDf9OMm/R1omOw4Zqhv7B4eKL+5a7zG6Vbms6R5tQ5aphgVOxhUn2L7T7FVJoEzHnwMnjJYYPu5Bqg50kr59O+tS+Fr3fvj4rm27RK8RQPouhHcHEOnBt51qSsKlXeKRNcGJohYJzXdaj0m/N1k6Egav6bFtYxM0k7KaV7AI6GQqOiwzlOtvqC9rlreyVKRQEYi+lLNB6APXZI9N4OuofXiS1kHWjQ/G/tMhOObtQLLNeP/Z0jggFJCjvYhWQomd+nALSvO0eECgYEA7cdnXwNoTLCpvelI3hE5I/gUXuowG1rdX4uu6KQP87uHV/zNfc/WeRJXSB+jBRBX9IoVP+5I/qc2KyqbmpomY7c7f4k6XlSZrp4KAfnZsN7dPihukVsXKUbshUzUa/o+oUCjHKz5DQ+Rcjs9JyumGWJxlYe5oyJa6uLhKeHHrckCgYEA1UGHsSYW8rEJB3sy1XwNeqzWPqE9JyKc4ORqAiIsPnv4db+3f7jLCOxgJOHGWooU/5yfk/pp5PciCuv7CJo9k2xNXmHhHWSBYqzYSbehIdnEsfP228BCvw5hrEdOu3GIrS2PK+6Y5WPChWZNwB2CKYTJ4KH5S7FA+ojpzriXqJ8CgYEApMmcB0oKP5Pzn00MlfIjwpzMKVdtzZd0ciIRLuN8trLRQpZOJ5IhljiyyqY6SWkhO7VysqLGbc2eid32hvesAVFcZ6/IBtXkyBJ45xOr3Zsmg0xsDEqvy4h+pIcxdD+ypfhw0o/B7l5Ks3sAj6P9cfw6saGlcrx9e+mOmIMD6pkCgYBz88eF6MH9f4j7Sl9feK4Tj7qGH0GS790A4vFI66/G4b08uNtbVO0AkxXLt/8T55R3T3/tA/FkD4OxEJJUIRlt+SswMGQoiSdYscaAfpncP/4VDCOjZKxmGbm95J/Ih3jbQLRiHL+BqnZv9io8VU8aqBrkSu2z3FMKZjtKrU+43QKBgQDqBWybIuzPxgZOxXEAKFHMq/g/46sBzEJQa7QsxEZtDSkTYAdfFfprXuAwHmibVq/2JNBg2ZuVcSrpoRrq87NZrcwdciDQ168gwJy4fYVujrpHLSnVKQLsBeC/QyxpG+3cGkmEAv47et8FNWTN2t0T8tma7RVGpw0W5iRjOfn8IA==\r\n-----END RSA PRIVATE KEY-----'
    this.rsaPublic = fs.readFileSync(opts.rsaPublic, 'utf-8');
}

var props = Alipay.prototype;

props.makeParams = function(method, biz_content) {
    return {
        app_id: this.appId,
        method: method,
        format: 'JSON',
        charset: 'utf-8',
        sign_type: this.signType,
        timestamp: new Date().format('yyyy-MM-dd hh:mm:ss'),
        version: '1.0',
        biz_content: JSON.stringify(biz_content)
    };
};

/**
 * 生成支付参数供客户端使用
 * @param {Object} opts
 * @param {String} opts.subject              商品的标题/交易标题/订单标题/订单关键字等
 * @param {String} [opts.body]               对一笔交易的具体描述信息。如果是多种商品，请将商品描述字符串累加传给body
 * @param {String} opts.outTradeId           商户网站唯一订单号
 * @param {String} [opts.timeout]            设置未付款支付宝交易的超时时间，一旦超时，该笔交易就会自动被关闭。
                                              当用户进入支付宝收银台页面（不包括登录页面），会触发即刻创建支付宝交易，此时开始计时。
                                              取值范围：1m～15d。m-分钟，h-小时，d-天，1c-当天（1c-当天的情况下，无论交易何时创建，都在0点关闭）。
                                              该参数数值不接受小数点， 如 1.5h，可转换为 90m。
 * @param {String} opts.amount               订单总金额，单位为元，精确到小数点后两位，取值范围[0.01,100000000]
 * @param {String} [opts.sellerId]           收款支付宝用户ID。 如果该值为空，则默认为商户签约账号对应的支付宝用户ID
 * @param {String} opts.goodsType            商品主类型：0—虚拟类商品，1—实物类商品 注：虚拟类商品不支持使用花呗渠道
 * @param {String} [opts.passbackParams]     公用回传参数，如果请求时传递了该参数，则返回给商户时会回传该参数。支付宝会在异步通知时将该参数原样返回。本参数必须进行UrlEncode之后才可以发送给支付宝
 * @param {String} [opts.promoParams]        优惠参数(仅与支付宝协商后可用)
 * @param {String} [opts.extendParams]       业务扩展参数 https://doc.open.alipay.com/docs/doc.htm?spm=a219a.7629140.0.0.3oJPAi&treeId=193&articleId=105465&docType=1#kzcs
 * @param {String} [opts.enablePayChannels]  可用渠道，用户只能在指定渠道范围内支付。当有多个渠道时用“,”分隔。注：与disable_pay_channels互斥
 * @param {String} [opts.disablePayChannels] 禁用渠道，用户不可用指定渠道支付。当有多个渠道时用“,”分隔。 注：与enable_pay_channels互斥
 * @param {String} [opts.storeId]            商户门店编号
 */
props.pay = function (opts) {

    var biz_content = {
        body: opts.body,
        subject: opts.subject,
        out_trade_no: opts.outTradeId,
        timeout_express: opts.timeout,
        total_amount: opts.amount,
        seller_id: opts.sellerId,
        product_code: 'QUICK_MSECURITY_PAY',
        goods_type: opts.goodsType,
        passback_params: opts.passbackParams,
        promo_params: opts.promoParams,
        extend_params: opts.extendParams,
        enable_pay_channels: opts.enablePayChannels,
        disable_pay_channels: opts.disablePayChannels,
        store_id: opts.storeId
    };

    var params = this.makeParams('alipay.trade.app.pay', biz_content);
    params.notify_url = this.notifyUrl;

    return utl.processParams(params, this.rsaPrivate, this.signType);
};

/**
 * 生成支付参数供web端使用
 * @param {Object} opts
 * @param {String} opts.subject              商品的标题/交易标题/订单标题/订单关键字等
 * @param {String} [opts.body]               对一笔交易的具体描述信息。如果是多种商品，请将商品描述字符串累加传给body
 * @param {String} opts.outTradeId           商户网站唯一订单号
 * @param {String} [opts.timeout]            设置未付款支付宝交易的超时时间，一旦超时，该笔交易就会自动被关闭。
                                              当用户进入支付宝收银台页面（不包括登录页面），会触发即刻创建支付宝交易，此时开始计时。
                                              取值范围：1m～15d。m-分钟，h-小时，d-天，1c-当天（1c-当天的情况下，无论交易何时创建，都在0点关闭）。
                                              该参数数值不接受小数点， 如 1.5h，可转换为 90m。
 * @param {String} opts.amount               订单总金额，单位为元，精确到小数点后两位，取值范围[0.01,100000000]
 * @param {String} [opts.sellerId]           收款支付宝用户ID。 如果该值为空，则默认为商户签约账号对应的支付宝用户ID
 * @param {String} opts.goodsType            商品主类型：0—虚拟类商品，1—实物类商品 注：虚拟类商品不支持使用花呗渠道
 * @param {String} [opts.passbackParams]     公用回传参数，如果请求时传递了该参数，则返回给商户时会回传该参数。支付宝会在异步通知时将该参数原样返回。本参数必须进行UrlEncode之后才可以发送给支付宝
 * @param {String} [opts.promoParams]        优惠参数(仅与支付宝协商后可用)
 * @param {String} [opts.extendParams]       业务扩展参数 https://doc.open.alipay.com/docs/doc.htm?spm=a219a.7629140.0.0.3oJPAi&treeId=193&articleId=105465&docType=1#kzcs
 * @param {String} [opts.enablePayChannels]  可用渠道，用户只能在指定渠道范围内支付。当有多个渠道时用“,”分隔。注：与disable_pay_channels互斥
 * @param {String} [opts.disablePayChannels] 禁用渠道，用户不可用指定渠道支付。当有多个渠道时用“,”分隔。 注：与enable_pay_channels互斥
 * @param {String} [opts.storeId]            商户门店编号
 * @param {String} [opts.return_url]         客户端回调地址，HTTP/HTTPS开头字符串
 */
props.webPay = function (opts) {
    console.log(opts)
    var biz_content = {
        body: opts.body,
        subject: opts.subject,
        out_trade_no: opts.outTradeId,
        timeout_express: opts.timeout,
        total_amount: opts.amount,
        seller_id: opts.sellerId,
        product_code: 'FAST_INSTANT_TRADE_PAY',
        goods_type: opts.goodsType,
        passback_params: opts.passbackParams,
        promo_params: opts.promoParams,
        extend_params: opts.extendParams,
        enable_pay_channels: opts.enablePayChannels,
        disable_pay_channels: opts.disablePayChannels,
        store_id: opts.storeId,
        return_url: opts.return_url
    };

    var params = this.makeParams('alipay.trade.page.pay', biz_content);
    params.notify_url = this.notifyUrl;
    console.log(params)
    return utl.processParams(params, this.rsaPrivate, this.signType);
};

/**
 * 签名校验
 * @param {Object} response 支付宝的响应报文
 */
props.signVerify = function (response) {
    var ret = utl.copy(response);
    var sign = ret['sign'];
    ret.sign = undefined;
    ret.sign_type = undefined;
    var tmp = utl.encodeParams(ret);
    return utl.signVerify(tmp.unencode, sign, this.rsaPublic, this.signType);
}

/**
 * 查询交易状态 https://doc.open.alipay.com/doc2/apiDetail.htm?spm=a219a.7629065.0.0.PlTwKb&apiId=757&docType=4
 * @param {Object} opts
 * @param {String} [opts.outTradeId]    订单支付时传入的商户订单号,和支付宝交易号不能同时为空。 tradeId,outTradeId如果同时存在优先取tradeId
 * @param {String} [opts.tradeId]       支付宝交易号，和商户订单号不能同时为空
 * @param {String} [opts.appAuthToken]  https://doc.open.alipay.com/doc2/detail.htm?treeId=216&articleId=105193&docType=1
 */
props.query = function (opts) {

    var biz_content = {
        out_trade_no: opts.outTradeId,
        trade_no: opts.tradeId
    };

    var params = {
        app_id: this.appId,
        method: 'alipay.trade.query',
        format: 'JSON',
        charset: 'utf-8',
        sign_type: this.signType,
        timestamp: new Date().format('yyyy-MM-dd hh:mm:ss'),
        version: '1.0',
        app_auth_token: opts.appAuthToken,
        biz_content: JSON.stringify(biz_content)
    };
    var params = this.makeParams('alipay.trade.query', biz_content);
    if(this.appAuthToken) {
        params.app_auth_token = this.appAuthToken;
    }

    var body = utl.processParams(params, this.rsaPrivate, this.signType);

    return utl.request({
        method: 'GET',
        url: (this.sandbox? alipay_gate_way_sandbox : alipay_gate_way) + '?' + body
    });
};


/**
 * 统一收单交易关闭接口 https://doc.open.alipay.com/doc2/apiDetail.htm?spm=a219a.7629065.0.0.6VzMcn&apiId=1058&docType=4
 * @param {Object} opts
 * @param {String} [opts.outTradeId]    订单支付时传入的商户订单号,和支付宝交易号不能同时为空。 tradeId,outTradeId如果同时存在优先取tradeId
 * @param {String} [opts.tradeId]       支付宝交易号，和商户订单号不能同时为空
 * @param {String} [opts.operatorId]    卖家端自定义的的操作员 ID
 * @param {String} [opts.appAuthToken]  https://doc.open.alipay.com/doc2/detail.htm?treeId=216&articleId=105193&docType=1
 */
props.close = function (opts) {

    var biz_content = {
        out_trade_no: opts.outTradeId,
        trade_no: opts.tradeId,
        operator_id: opts.operatorId
    };

    var params = this.makeParams('alipay.trade.close', biz_content);
    if(this.appAuthToken) {
        params.app_auth_token = this.appAuthToken;
    }

    var body = utl.processParams(params, this.rsaPrivate, this.signType);

    return utl.request({
        method: 'GET',
        url: (this.sandbox? alipay_gate_way_sandbox : alipay_gate_way) + '?' + body
    });
};


/**
 * 统一收单交易退款接口 https://doc.open.alipay.com/doc2/apiDetail.htm?spm=a219a.7629065.0.0.PlTwKb&apiId=759&docType=4
 * @param {Object} opts
 * @param {String} [opts.outTradeId]    订单支付时传入的商户订单号,和支付宝交易号不能同时为空。 tradeId,outTradeId如果同时存在优先取tradeId
 * @param {String} [opts.tradeId]       支付宝交易号，和商户订单号不能同时为空
 * @param {String} [opts.operatorId]    卖家端自定义的的操作员 ID
 * @param {String} [opts.appAuthToken]  https://doc.open.alipay.com/doc2/detail.htm?treeId=216&articleId=105193&docType=1
 * @param {String} opts.refundAmount    需要退款的金额，该金额不能大于订单金额,单位为元，支持两位小数
 * @param {String} [opts.refundReason]  退款的原因说明
 * @param {String} [opts.outRequestId]  标识一次退款请求，同一笔交易多次退款需要保证唯一，如需部分退款，则此参数必传。
 * @param {String} [opts.storeId]       商户的门店编号
 * @param {String} [opts.terminalId]    商户的终端编号
 */
props.refund  = function (opts) {

    var biz_content = {
        out_trade_no: opts.outTradeId,
        trade_no: opts.tradeId,
        operator_id: opts.operatorId,
        refund_amount: opts.refundAmount,
        refund_reason: opts.refundReason,
        out_request_no: opts.outRequestId,
        store_id: opts.storeId,
        terminal_id: opts.terminalId
    };

    var params = this.makeParams('alipay.trade.refund', biz_content);
    if(this.appAuthToken) {
        params.app_auth_token = this.appAuthToken;
    }

    var body = utl.processParams(params, this.rsaPrivate, this.signType);

     utl.request({
        method: 'GET',
        url:  body
    }).then(function (ret) {
         console.log("***** ret.body=" + body);
     });
};


/**
 * 统一收单交易退款查询 https://doc.open.alipay.com/doc2/apiDetail.htm?docType=4&apiId=1049
 * @param {Object} opts
 * @param {String} [opts.outTradeId]    订单支付时传入的商户订单号,和支付宝交易号不能同时为空。 tradeId,outTradeId如果同时存在优先取tradeId
 * @param {String} [opts.tradeId]       支付宝交易号，和商户订单号不能同时为空
 * @param {String} [opts.outRequestId]  请求退款接口时，传入的退款请求号，如果在退款请求时未传入，则该值为创建交易时的外部交易号
 * @param {String} [opts.appAuthToken]  https://doc.open.alipay.com/doc2/detail.htm?treeId=216&articleId=105193&docType=1
 */
props.refundQuery = function (opts) {

    var biz_content = {
        out_trade_no: opts.outTradeId,
        trade_no: opts.tradeId,
        out_request_no: opts.outRequestId || opts.outTradeId
    };

    var params = this.makeParams('alipay.trade.fastpay.refund.query', biz_content);
    if(this.appAuthToken) {
        params.app_auth_token = this.appAuthToken;
    }

    var body = utl.processParams(params, this.rsaPrivate, this.signType);

    return utl.request({
        method: 'GET',
        url: (this.sandbox? alipay_gate_way_sandbox : alipay_gate_way) + '?' + body
    });
};


/**
 * 查询对账单下载地址 https://doc.open.alipay.com/doc2/apiDetail.htm?spm=a219a.7629065.0.0.iX5mPA&apiId=1054&docType=4
 * @param {Object} opts
 * @param {String} [opts.billType]     账单类型，商户通过接口或商户经开放平台授权后其所属服务商通过接口可以获取以下账单类型：
                                        trade、signcustomer；trade指商户基于支付宝交易收单的业务账单；signcustomer是指基于商户支付宝余额收入及支出等资金变动的帐务账单；
 * @param {String} [opts.billDate]     账单时间：日账单格式为yyyy-MM-dd，月账单格式为yyyy-MM。
 * @param {String} [opts.appAuthToken]  https://doc.open.alipay.com/doc2/detail.htm?treeId=216&articleId=105193&docType=1
 */
props.billDownloadUrlQuery = function (opts) {

    var biz_content = {
        bill_type: opts.billType,
        bill_date: opts.billDate
    };

    var params = this.makeParams('alipay.data.dataservice.bill.downloadurl.query', biz_content);
    if(this.appAuthToken) {
        params.app_auth_token = this.appAuthToken;
    }

    var body = utl.processParams(params, this.rsaPrivate, this.signType);

    return utl.request({
        method: 'GET',
        url: (this.sandbox? alipay_gate_way_sandbox : alipay_gate_way) + '?' + body
    });
}
module.exports = Alipay;