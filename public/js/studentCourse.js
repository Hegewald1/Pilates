$(document).ready( function () {
    let table = $('#usersOnTable')
    .DataTable({
        select: {
            style: 'single'
        },
        "columnDefs": [{
            "targets": [ 0,1 ],
            "visible": false,
            "searchable": false

        }]
    });
    $('#usersOnTable tbody').on('click', 'tr', function () {
        let userid = table.row(this).data()[0];
        let courseid = table.row(this).data()[1];
        let url = "/removestudentsCourse";
        let data = { user: userid, course: courseid };
        axios.post(url, data)
        .then(function(response) {
        });
        setTimeout(function name(params) {
            window.location.href = '/studentsCourse/' + courseid;
        },100);
    });
});
$(document).ready( function () {
    let table = $('#usersNotOnTable')
    .DataTable({
        select: {
            style: 'single'
        },
        "columnDefs": [{
            "targets": [ 0,1 ],
            "visible": false,
            "searchable": false

        }]
    });
    $('#usersNotOnTable tbody').on('click', 'tr', function () {
        let userid = table.row(this).data()[0];
        let courseid = table.row(this).data()[1];
        let url = "/addstudentsCourse";
        let data = { user: userid, course: courseid };
        axios.post(url, data).then((res) => {
        });
        setTimeout(function name(params) {
            window.location.href = '/studentsCourse/' + courseid;
        },100);
    });
});
