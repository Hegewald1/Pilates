$(document).ready(function() {
    let table = $("#usersOnTable").DataTable({
        select: {
            style: "single"
        },
        columnDefs: [{
            targets: [0, 1],
            visible: false,
            searchable: false
        }]
    });
    $("#usersOnTable tbody").on("click", "tr", function() {
        let userid = table.row(this).data()[0];
        let lessonid = table.row(this).data()[1];
        let url = "/removestudentsLesson";
        let data = { user: userid, lesson: lessonid };
        axios.post(url, data).then(function(response) {
        });
        setTimeout(function name(params) {
            window.location.href = '/studentsLesson/' + lessonid;
        },100);
    });
});
$(document).ready(function() {
    let table = $("#usersNotOnTable").DataTable({
        select: {
        style: "single"
        },
        columnDefs: [{
            targets: [0, 1],
            visible: false,
            searchable: false
        }]
    });
    $("#usersNotOnTable tbody").on("click", "tr", function() {
        let userid = table.row(this).data()[0];
        let lessonid = table.row(this).data()[1];
        let url = "/addstudentsLesson";
        let data = { user: userid, lesson: lessonid };
        axios.post(url, data).then(res => {
        });
        setTimeout(function name(params) {
            window.location.href = '/studentsLesson/' + lessonid;
        },100);
    });
});

