import RestResource from "../../../../service/isAdmin";
const restResourceService = new RestResource();
import Analitic from "../../../../shared/Analitic";
import Spinner from "../../../../shared/Spinner.vue";
import XLSX from 'xlsx'
export default {
    name : 'Consolidados',
    components : {
      Analitic, Spinner
    },
    data() {
        return{
            tab: "sec3",
            isconsolidado: true,
            isTabla: false,
            isExcel: false,
            intensivos: null,
            infoMat: null,
            roles: this.$store.state.user.roles,
            isIntensivo : false,
            isExtraordianrio : false,
            isTodo : false,
        }
    },
    methods: {
        verificarUsuario() {
            if (!restResourceService.admin(this.roles)) {
              this.$router.push("/");
            }
          },
        mostrarConsolidado(){
            this.isconsolidado = false;
            this.__getData();
        },
        __getData() {
            this.isTabla = true;
            this.$proxies._matriculaProxi
              .getMatriculas()
              .then((x) => {
                this.infoMat = x.data;
                this.isTabla = false;
              })
              .catch((err) => {
                console.log("Error", err);
                this.isTabla = false;
              });
          },
        __consolidadoExtra(){
          this.isExtraordianrio = true;
            this.intensivos = this.infoMat.filter((x) => x.typo == "m2" );
            var contador = this.intensivos.length;
            this.ExportEcxel(contador, this.intensivos);
            setTimeout(() => this.isExtraordianrio = false, 3000); 
        },
        __consolodadoIntensivo(){
           this.isIntensivo = true;
            this.intensivos = this.infoMat.filter((x) => x.typo == "m1" );
            var contador = this.intensivos.length;
            this.ExportEcxel(contador, this.intensivos);
            setTimeout(() => this.isIntensivo = false, 3000); 
        },
        __todo(){
          this.isTodo = true;
            this.intensivos = this.infoMat;
            var contador = this.intensivos.length;
            this.ExportEcxel(contador, this.intensivos);
            setTimeout(() => this.isTodo = false, 3000); 
        },
        ExportEcxel(contador, model){
            this.isExcel= true;
            var anArray = [];
            for(let i=0; i<contador; i++){
              var objeto =   {
                index : i,
                nombres: model[i].fkestudiante.fullname,
                cedula:  model[i].fkestudiante.cedula,
                email:  model[i].fkestudiante.email,
                parroquia:  model[i].fkestudiante.fkparroquia,
                sexo:  model[i].fkestudiante.sexo,
                curso : model[i].fknivel.nombres,
                paralelo: model[i].curso,
                }
                anArray.push(objeto);
            }
            let data = XLSX.utils.json_to_sheet(anArray, {
              header: ['index', 'nombres', 'cedula','email','parroquia','sexo','curso', 'paralelo']
            })
            data['A1'].v = 'INDEX'
            data['B1'].v = 'NOMBRES'
            data['C1'].v = 'CEDULA'
            data['D1'].v = 'EMAIL'
            data['E1'].v = 'PARROQUIA'
            data['F1'].v = 'SEXO'
            data['G1'].v = 'CURSO'
            data['H1'].v = 'PARALELO'
            const workbook = XLSX.utils.book_new()
            const filename = 'Consolidado'
            XLSX.utils.book_append_sheet(workbook, data, filename)
            XLSX.writeFile(workbook, `${filename}.xlsx`)
            this.isExcel= false;
        },
    },
    created() {
        this.verificarUsuario();
      },
}