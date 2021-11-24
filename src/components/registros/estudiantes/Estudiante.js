import RestResource from '../../../service/isAdmin'
const restResourceService = new RestResource();
import Spinner from '../../../shared/Spinner'
export default {
  name: "indexUsiario",
  components: {
    Spinner
  },
  data() {
    return {
      roles: this.$store.state.user.roles,
      totalNotas: 0,
      paginaActual: 1,
      info: null,
      pagg: null,
      pagina: 0,
      paginas: 0,
      isLoading: false, //EL SNIPPER CARGA EN FALSO
      isSelecUsers: [],
      modals: 'closed',
      subtitulo: 'none',
      iseliminaddo : false,
      contador : 0,
      contador2 : 0,
      viewtable:1,
      listbuscador: {},
      searchQuery: null,
      rows: 6,
      isActive : false,
    };
  },
  computed: {
   
    resultQuery() {
      if (this.searchQuery) {
        return this.listbuscador.filter((item) => {
          return this.searchQuery
            .toLowerCase()
            .split(" ")
            .every((v) => item.fullname.toLowerCase().includes(v));
        });
      } 
    },
  },
  methods: {
    verificarUsuario(){
      if(!restResourceService.admin(this.roles)){
        this.$router.push("/");
      }
    },
    getAll(pag) {
      this.isLoading = true;
      this.subtitulo = this.rows + ' filas por página';
      this.$proxies._registroProxi
        .getAll(pag, this.rows) //EJECUTA LOS PROXIS QUE INYECTA AXIOS
        .then((x) => {
          this.info = x.data.usuarios;
          this.pagg = x.data;
          this.pagina = this.pagg.pagina;
          this.paginas = this.pagg.paginas;
          this.totalNotas = this.pagg.total;
          this.isLoading = false;
        })
        .catch(() => {
          console.log("Error imposible");
          this.isLoading = false;
        });
    },
    __eliminar(idn) {
      this.isLoading = true;
      if (confirm('Estás a punto de eliminar a un estudiante de esta cuenta. Esta acción no se puede deshacer.')) {
        this.$proxies._registroProxi
        .remove(idn) //EJECUTA LOS PROXIS QUE INYECTA AXIOS
        .then(() => {
          this.$notify({
            group: "global",
            text: "Registro destruido",
          });
          this.isLoading = false;
          this.getAll(1,6);
        })
        .catch((x) => {
          if (x.response.status == 403) {
            //ENVIA EL TOKEN SI NO TIENE EL PERMISO RETORNA UN STATUS 403 NO AUTHORIZATION
            alert("Usted no tiene permisos");
          }
          console.log("Error", x);
          this.isLoading = false;
        });
      }else{
        this.isLoading = false;
      }
     
    },

    selectUser(key){
      let longitud = this.isSelecUsers.length;
      let isExiste = 0;
      if(longitud>0){
         for (let i = 0; i < this.isSelecUsers.length; i++) {
            if(this.isSelecUsers[i]==key){
             this.isSelecUsers.splice(i, 1); 
             isExiste = 1;
             break;
            }
         }
         if(isExiste===0){ 
           this.isSelecUsers.push(key);
         }
      }else{
       this.isSelecUsers.push(key);
      } 
    },

    remove() {
      //METODO PARA ELIMINAR  ROW
      if (
        confirm(
          "ESTA SEGURO QUE QUIERE ELIMINAR? YA QUE ESOS CAMBIOS NO SE PUEDE REVERTIR"
        )
      ) {
        this.iseliminaddo = true;
        let isArray = this.isSelecUsers.length;
        if(isArray>0){
          this.$proxies._registroProxi
            .remove(this.isSelecUsers)
            .then(() => {
              this.iseliminaddo = false;
              this.isSelecUsers= [];
              this.getAll(1,6); 
            })
            .catch(() => {
              console.log("Error imposible");
            });
          this.$notify({
            group: "global",
            text: "Registro destruido",
          });
          
       }
      }
    },
    editar(){
      let isArray = this.isSelecUsers.length;
        if(isArray===1){
          this.$router.push({path: `/Estudiate/${this.isSelecUsers[0]}/edit`})
        }
    },
    buscar(){//buscadorUsuario
      this.isSelecUsers = [];
      this.contador = this.contador +1;
      this.contador2 = this.contador2 +1;
      if (this.contador===1) {
         this.viewtable = 2;
         if (this.contador2===1) {
           this.isLoading = true;
           this.$proxies._registroProxi
             .buscadorAlumno() //EJECUTA LOS PROXIS QUE INYECTA AXIOS
             .then((x) => {
               this.listbuscador = x.data.usuarios;
               this.isLoading = false;
             })
             .catch(() => {
               console.log("Error imposible");
               this.isLoading = false;
             });
         }
         
      }
     },
     salirBusqueda(){
       this.viewtable = 1;
       this.contador=0;
       this.searchQuery = null;
       this.isSelecUsers = [];
     },
     cambiar_pagina(num){
      this.rows = num;
      this.getAll(1);
     }
  },
  created() {
    this.verificarUsuario();
  },
  watch: {
    "$route.query.pagina": {
      immediate: true,
      handler(pagina) {
        pagina = parseInt(pagina) || 1;
        this.getAll(pagina);
        this.paginaActual = pagina;
      },
    },
    // 'isSelecUsers' : function () {
    //   if(this.isSelecUsers.length!=1){
    //     this.isActive = true;
    //     console.log(this.isActive)
    //   }else{
    //     this.isActive = false;
    //     console.log(this.isActive)
    //   }
    // }
  },
};
