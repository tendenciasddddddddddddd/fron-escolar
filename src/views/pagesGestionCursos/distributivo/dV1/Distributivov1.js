import Spinner from "../../../../shared/Spinner";
import IsSelect from '../../../../shared/IsSelect'
export default {
    name: 'Distrivutivov1',
    components: {
        Spinner,IsSelect
      },
    data(){
      return {
          tab: "init",
          isPeriodo: false,
          isCurso: false,
          isMateria: false,
          isDocente: false,
          ifLoad: false,
          namePeriodoActual: '',
          isperiodoActual: null,
          isLoading: false,
          info: null,
          model:{
            nombre: 'Intensivo',
            icono : 'mensaje.svg',
            fnivel: null,
            fdocente: null,
            fmateria: null,
            facademicos: null,
            paralelo: null,
          },
          listPeriodo: null,
          listniveles: null,
          listDocentes: null,
          listMaterias: null,
          paralelos: [
            {
              value: "0",
              nombre: "B",
            },
            {
              value: "1",
              nombre: "G",
            },

          ],
          isSelecUsers: [],
          subtitulo: 'none',
          iseliminaddo : false,
          isCarga: false,
      }
    },
    methods: {

       __listNivele() {
        //-----------TRAE LA LISTA DE LOS ROLES
        this.isCurso = true;
        this.$proxies._gestionProxi
          .getNiveles()
          .then((x) => {
            let filtrosNiveles = x.data;
            this.listniveles = filtrosNiveles.filter((x) => x.modalidad == 'Intensivo');
            this.isCurso = false;
          })
          .catch((err) => {
            console.log("Error", err);
            this.isCurso = false;
          });
      },
      __listdocentes() {
        //-----------TRAE LA LISTA DE LOS ROLES
        this.isDocente = true;
        this.$proxies._registroProxi
          .getListDocentes()
          .then((x) => {
            this.listDocentes = x.data;
            this.isDocente = false;
          })
          .catch((err) => {
            console.log("Error", err);
            this.isDocente = false;
          });
      },
      __listmaterias() {
        //-----------TRAE LA LISTA DE LOS ROLES
        this.isMateria = true;
        this.$proxies._gestionProxi
          .getListMaterias()
          .then((x) => {
            this.listMaterias = x.data;
            this.isMateria = false;
          })
          .catch((err) => {
            console.log("Error", err);
            this.isMateria = false;
          });
      },
      save() {
        //-----------BOTTON DE GUADAR TIENE VALIDAR Y SI EL ID ES NULL ENTONCES GUARDA
        this.isSelecUsers= [];
        this.$validate().then((success) => {
          //METODO PARA GUARDAR
          if (!success) {
            this.$notify({
              group: "global",
              text: "Por favor llena correctamente los campos solicitados",
            });
            return;
          }
          if(this.model._id){
            this.ifLoad = true;
            this.model.fnivel = this.model.fnivel._id;
            this.model.fdocente = this.model.fdocente._id;
            this.model.fmateria = this.model.fmateria._id;
            this.model.facademicos = this.model.paralelo.nombre;
            this.model.paralelo = this.model.paralelo.nombre;
            this.$proxies._gestionProxi.updateDistributivo(this.model._id, this.model)
              .then(() => {
                this.__limpiarCampos();
                this.tab= "init";
                this.ifLoad = false;
                this.getAll(this.pagina,6);
              })
              .catch((x) => {
                alert("Error"+x);
                this.ifLoad = false;
              });    
          }else{
            this.ifLoad = true;
            this.model.fnivel = this.model.fnivel._id;
            this.model.fdocente = this.model.fdocente._id;
            this.model.fmateria = this.model.fmateria._id;
            this.model.facademicos = this.$route.params.id;
            this.model.paralelo = this.model.paralelo.nombre;
            this.$proxies._gestionProxi
              .createDistributivo(this.model) //-----------GUARDAR CON AXIOS
              .then(() => {
                this.ifLoad = false;
                this.__limpiarCampos();
                this.tab= "init";
                this.getAll(this.pagina,6);
              })
              .catch((error) => {
                //-----------EN CASO DE TENER DUPLICADO LOS DOCUMENTOS EL SERVIDOR LANZARA LA EXEPCION
                this.ifLoad = false;
                if (error.response) {
                  if (error.response.status == 400) {
                    
                    this.$notify({
                      group: "global",
                      text: error.response.data.message,
                    });
                    this.$router.push('/Error-reg')
                  }
                } else if (error.request) {
                  alert("duplicado 2");
                } else {
                  console.log("Error", error.message);
                }
              });
          }     
          //-----------DE LO CONTRARIO ENTRA A SER UN DOCUMENTO NUEVO
          
        });
      },
      getAll(pag, lim) {
        this.isLoading = true;
        this.subtitulo = lim + ' filas por página';
          let modalidad = 'Intensivo';
          this.$proxies._gestionProxi
            .getAllDistributivo(pag, lim, modalidad) //EJECUTA LOS PROXIS QUE INYECTA AXIOS
            .then((x) => {
              this.info = x.data.niveles;
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

      gets() { 
        let isArray = this.isSelecUsers.length;
        if(isArray===1){
          this.isCarga = true; 
        this.__limpiarCampos();
        this.$proxies._gestionProxi.getDistributivo(this.isSelecUsers[0])
            .then((x) => {
                this.model = x.data;
                this.isCarga = false; 
                this.tab= "init1";
            }).catch(() => {
                console.log("Error")
                this.isCarga = false; 
            });
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
            this.$proxies._gestionProxi
          .removeDistributivo(this.isSelecUsers)
              .then(() => {
                this.iseliminaddo = false;
                this.isSelecUsers= [];
                this.getAll(this.pagina,6); 
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
      __limpiarCampos(){
        this.model._id = "";
        this.model.facademicos = null;
        this.model.fnivel = null;
        this.model.paralelo = null;
        this.model.fdocente = null;
        this.model.fmateria = null;
      },
      MostrarModal(){
        this.__limpiarCampos();
        this.tab= "init1";
      }
    },
    created() {
        this. __listNivele();
        this.__listdocentes();
        this. __listmaterias();
    },
    watch: {
      "$route.query.pagina": {
        immediate: true,
        handler(pagina) {
          pagina = parseInt(pagina) || 1;
          this.getAll(pagina,6);
          this.paginaActual = pagina;
          
        },
      },
    },
    validators: {
        //ATRIBUTOS RAPA VALIDAR LOS CAMBIOS fmateria
    

        "model.fnivel"(value) {
            return this.$validator.value(value).required();
          },
          "model.paralelo"(value) {
            return this.$validator.value(value).required();
          },
          "model.fdocente"(value) {
            return this.$validator.value(value).required();
          },
          "model.fmateria"(value) {
            return this.$validator.value(value).required();
          },
      },
}