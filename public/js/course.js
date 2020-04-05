$(document).ready( function () {
    let table = $('#courseTable')
    .DataTable({
        select: {
            style: 'single'
        },
        "columnDefs": [{
            "targets": [ 0 ],
            "visible": false,
            "searchable": false

        }]
    });
    $('#courseTable tbody').on('click', 'tr', function () {
        let id = table.row(this).data()[0];
        window.location.href = 'course/' + id;
    });
})