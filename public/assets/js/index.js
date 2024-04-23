$("#add_user").submit(function (event) {
    alert("Data Inserted Successfully!");
})

$("#update_user").submit(function (event) {
    event.preventDefault();

    let unindexed_array = $(this).serializeArray();
    let data = {};
    $.map(unindexed_array, function (n, i) {
        data[n['name']] = n['value']
    })

    console.log(data);

    let request = {
        'url': `http://localhost:8080/admin/api/users/${data.id}`,
        'method': 'PUT',
        'data':data
    }

    $.ajax(request).done(function (response) {
        alert('Data updated Successfully!')
    })
})

if (window.location.pathname == '/admin/') {
    $ondelete = $('.table tbody td a.delete');
    $ondelete.click(function () {
        let id = $(this).attr("data-id")

        let request = {
            'url': `http://localhost:8080/admin/api/users/${id}`,
            'method': 'DELETE'
        }

        if (confirm("Do you really want to delete this record?")) {
            $.ajax(request).done(function (response) {
                alert('Data Deleted Successfully!');
                location.reload();
            })
        }
    })
}