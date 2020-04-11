let socket = io();

let vm = new Vue({
    el: '#app',
    data: {
      users: [],
      current: null,
      lastStarted: 0,
      timer: 0
    },
    mounted() {
      this.getUsers()

      setInterval(this.currentTime, 1000)      

      socket.on('change-event', (data) => {
        this.users = data.users
        this.current = data.current
        this.lastStarted = data.last_started !== null ? data.last_started : 0
        
        this.currentTime()
      })
    },
    methods: {
       getUsers() {
        axios.get('/get-users')
        .then(res => {
           this.users = res.users
           this.current = res.current
           this.lastStarted = res.last_started !== null ? res.last_started : 0
        })
        .catch(err => console.log(err)) 
      },
      currentTime () {
        let diff = moment().diff(this.lastStarted)
        this.timer = moment.utc(diff).format('HH:mm:ss')
      }
    }
})
