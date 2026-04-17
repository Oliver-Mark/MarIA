document.addEventListener('DOMContentLoaded', function() {
    flatpickr("#calendario", {
        inline: true,
        locale: "pt",
        defaultDate: "today",
        fixedWeeks: true,
        onChange: function(selectedDates, dateStr, instance) {
            console.log("O usuário clicou no dia: ", dataStr);
        }
    })
})