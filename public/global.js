var mqttlink1 = 'mqtt://192.168.0.73:3001';
if (location.protocol == 'https:') {    
    mqttlink1 = 'mqtts://192.168.0.73:3000';
}
const order_topic = {
    trans: 'trans-orderbook/',
    rec: 'rec-orderbook/'
}
const symbol_topic = {
    trans: 'trans-symbols',
    rec: 'rec-symbols'
}
const mqttclient = mqtt.connect(mqttlink1, credential);
mqttclient.on('connect', function () {
    integratetopic(generateTopic(symbol_topic.trans), generateTopic(symbol_topic.rec), '');
});
mqttclient.on('message', function (topic, message) {
    try {   
        if (topic.includes(generateTopic(symbol_topic.trans))) {
            getsymbols(parseJSONorNot(parseJSONorNot(message.toString())));
            thMarketnames = symbols.bittrex.name
            baseCurrency = getSymbolObjWithExchange(symbol).base;
            quoteCurrency = getSymbolObjWithExchange(symbol).quote;
            onLoadChart()
            getorderbook(symbol, widgetExchange, true);
            sendSummeriesRequest(exchange, activeInterval, true);
        } else if (topic.includes(generateTopic(order_topic.trans))) {
            orderdata = parseJSONorNot(message.toString());
            dispOrderData(orderdata, symbol, widgetExchange);
            dispOrderChart(orderdata, symbol, widgetExchange);
        } else if (topic.includes(generateTopic(trans_summery_topic.general))) {
            activedata = parseJSONorNot(message.toString());
            getActiveContent(activedata);
        } else if (topic.includes(generateTopic(radar_topic.trans))) {
            radardata = parseJSONorNot(message.toString());
            dispRadarDataWithHurst(radardata);
        }
    } catch (error) {
        console.log(error.toString());
    }
});
function subscribe_ohlc(listenerID, issubscribe) {
    try {
        const listenSym = listenerID.replace('#USDT', '');/// CUSTOM INDICIATOR REMOVE
        const sub_interval = listenSym.split('_')[listenSym.split('_').length - 1];
        const sub_symbol = listenSym.replace(`_${sub_interval}`, '');
        const symbolObj = getSymbolObjWithExchange(sub_symbol);
        const recsubscribeTopic = `${generateTopic(rec_ohlc_topic.general)}${sub_interval.toLowerCase()}/@${symbolObj.coinapi_id.toLowerCase()}`;
        if (issubscribe) {
            integratetopic(recsubscribeTopic, '', '');
        } else {
            const curSymbolObj = getSymbolObjWithExchange(symbol);
            const curTopic = `${generateTopic(rec_ohlc_topic.general)}${interval.toLowerCase()}/@${curSymbolObj.coinapi_id.toLowerCase()}`;
            if (curTopic != recsubscribeTopic) {
                removetopic(recsubscribeTopic);
            }
        }
    } catch (error) {
    }
}
function integratetopic(sub_topic, pub_topic, pub_obj) {
    if (sub_topic != '')
        mqttclient.subscribe(sub_topic.toLowerCase());
    if (pub_topic != '')
        mqttclient.publish(pub_topic.toLowerCase(), JSON.stringify(pub_obj), credential);
}
function removetopic(topic) {
    mqttclient.unsubscribe(topic.toLowerCase());
    for (var key in mqttclient.messageIdToTopic) {
        if (mqttclient.messageIdToTopic[key][0] == topic.toLowerCase()) {
            delete mqttclient.messageIdToTopic[key];
        }
    }
}
function generateTopic(topic) {
    return `${basetopic}\/${credential.username}\/${topic}`
}
//////////////////////////////////////////////////////
