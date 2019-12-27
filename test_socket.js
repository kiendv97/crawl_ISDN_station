var app = require('express')();
var http = require('http');
var httpServer = http.createServer(app);
httpServer.listen(3030, () => {
    console.log('Listen on 3030');

});
var io = require('socket.io')(httpServer);

const mockData = {
    "Số TB": "933253453",
    "Loại TB": "Số MobiFone",
    "Trạng thái": "Số đang sử dụng",
    "Ngày thay đổi": "25-09-2017",
    "Mã cửa hàng": "2BTH00184",
    "Ngày tạo số": "25-05-2007",
    "Loại số": "Tu do",
    "Công ty": "8",
    "Số cấm tác động": "Không",
    "Loại cam kết": "CK150_40\t[Lịch sử]"
}
io.on('connection', function (socket) {
    console.log('Connected!');
    socket.emit('receive_data', mockData);

    socket.on('send_data', (data) => {
        console.log('Send Data -- client: ' + data);

    })


});
