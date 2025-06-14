import { Component, OnInit } from '@angular/core';
import { LocalDataSource } from 'ng2-smart-table';
import { HttpClient } from '@angular/common/http';
import {
  NbComponentStatus,
  NbGlobalLogicalPosition,
  NbGlobalPhysicalPosition,
  NbGlobalPosition,
  NbToastrService,
  NbToastrConfig,
} from '@nebular/theme';
import { SmartTableData } from '../../../@core/data/smart-table';

@Component({
  selector: 'ngx-product',
  templateUrl: './product.component.html',
  styleUrls: ['./product.component.scss'],
})
export class ProductComponent implements OnInit{
apiUrl:string = "https://localhost:7228/";
  settings = {
    add: {
      addButtonContent: '<i class="nb-plus"></i>',
      createButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
      confirmCreate: true
    },
    edit: {
      editButtonContent: '<i class="nb-edit"></i>',
      saveButtonContent: '<i class="nb-checkmark"></i>',
      cancelButtonContent: '<i class="nb-close"></i>',
      mode: 'inline',
      confirmSave: true
    },
    delete: {
      deleteButtonContent: '<i class="nb-trash"></i>',
      confirmDelete: true,
    },
    columns: {
      
      producT_ID: {
        title: 'Product ID',
        type: 'string',
        editable: false,
        hide: true
      },
      name: {
        title: 'Product Name',
        type: 'string',
        editable: false
      },
      category: {
        title: 'Category',
        type: 'string',
        editable: false,
        hide: true
      },
      sku: {
        title: 'SKU',
        type: 'string'
      },
      description: {
        title: 'Description',
        type: 'string'
      },
      unit: {
        title: 'Unit',
        type: 'number',
        editable: true
      },
      miN_THRESHOLD: {
        title: 'Min Threshold',
        type: 'string',
        editable: true
      },
      maX_THRESHOLD: {
        title: 'Max Threshold',
        type: 'string',
        editable: true
      }
    },
  };

  source: LocalDataSource = new LocalDataSource();
  config: NbToastrConfig;
  destroyByClick = true;
  duration = 4000;
  hasIcon = true;
  position: NbGlobalPosition = NbGlobalPhysicalPosition.TOP_RIGHT;
  preventDuplicates = false;
  constructor(private service: SmartTableData, private http : HttpClient, private toastrService: NbToastrService) {
  }

  

  ngOnInit(){
    this.getLookupData()
    //this.getInventoryList();
  }

  getLookupData(){
    this.http.get(this.apiUrl + 'api/inventory/lookup-data').subscribe((data:any) => {
          if(data){
            this.source.load(data.products);
            // if(data.categories.length > 0){
            //   let dataList = data.categories.map((val) => {
            //     let obj={};
            //     obj['value'] = val?.name;
            //     obj['title'] = val?.name;
            //     return obj;
            //   });
            //   this.settings.columns.category.editor.config.list = dataList;
            //   this.settings = Object.assign({}, this.settings);
            // }
          }
    });
  }
  getInventoryList(){
    this.http.get('/api/inventory-list').subscribe((data:any) => {
          if(data){
            this.source.load(data);
          }
    });
  }
  onCreateConfirm(event): void {
    const data = event.data;
    if(data && data.productName && data.category && data.quantity && data.warehouse && !isNaN(+data.quantity) && data.quantity < 0){
      this.showToast('success','Success', "Record added successfully." )
      // this.http.post('/api/update-inventory', data).subscribe(resp =>{
        
      //   //display toaster message
      // });
    }
    this.showToast('warning','Warning', "Fields cannot be blank" )
    return;    
  }
  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
       const data = event.data;
      this.showToast('success','Success', "Record deleted successfully." );
      // this.http.post(this.apiUrl + 'api/inventory/delete-inventory', data).subscribe(resp =>{
      //   this.getInventoryList();
      // });
    } else {
      event.confirm.reject();
    }
  }

  onSaveConfirm(event): void {
    const updatedData = event.newData;
    if(!updatedData.quantity){
      this.showToast('warning','Warning', "Fields cannot be blank." )
      //display alert
      return;
    }
    // if(!updatedData || isNaN(+updatedData.quantity) || updatedData.quantity < 0){
    //   this.showToast('warning','Warning', "Quantity should be numeric and non-negative" )
    //   //display alert
    //   return;
    // }
    this.showToast('success','Success', "Record updated successfully." );
    // this.http.post(this.apiUrl + 'api/inventory/update-inventory', updatedData).subscribe(resp =>{
    //     this.getInventoryList();
    // });
  }
  private showToast(type: NbComponentStatus, title: string, body: string) {
      const config = {
        status: type,
        destroyByClick: this.destroyByClick,
        duration: this.duration,
        hasIcon: this.hasIcon,
        position: this.position,
        preventDuplicates: this.preventDuplicates,
      };
      const titleContent = title ? `${title}` : '';
  
      this.toastrService.show(
        body,
        titleContent,
        config);
  }
}
