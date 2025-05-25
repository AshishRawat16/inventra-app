import { Component } from '@angular/core';
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
export class ProductComponent {

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
      batchId: {
        title: 'Product Name',
        type: 'string',
        editable: false,
        hide: true
      },
      productName: {
        title: 'Product Name',
        type: 'string',
        editable: false
      },
      category: {
        title: 'Category',
        type: 'string',
        editable: false
      },
      quantity: {
        title: 'Quantity',
        type: 'number',
        editable: true
      },
      status: {
        title: 'Status',
        type: 'string',
        editable: false
      },
      warehouse: {
        title: 'Warehouse Name',
        type: 'string',
        editable: false
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
    const data = this.service.getData();
    this.source.load(data);
  }

  onDeleteConfirm(event): void {
    if (window.confirm('Are you sure you want to delete?')) {
      event.confirm.resolve();
       const data = event.data;
      this.http.post('/api/delete-inventory', {'batchId' : data.batchId}).subscribe(resp =>{
        this.showToast('success','Success', "Record deleted successfully." )
      });
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
    if(!updatedData || isNaN(+updatedData.quantity) || updatedData.quantity < 0){
      this.showToast('warning','Warning', "Quantity should be numeric and non-negative" )
      //display alert
      return;
    }
    this.http.post('/api/update-inventory', {'batchId' : updatedData.batchId, 'quantity' : updatedData.quantity}).subscribe(resp =>{
        this.showToast('success','Success', "Record updated successfully." )
    });
  }

  ngOnInit(){
    this.getInventoryList();
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
      this.http.post('/api/update-inventory', data).subscribe(resp =>{
        this.showToast('success','Success', "Record added successfully." )
        //display toaster message
      });
    }
    this.showToast('warning','Warning', "Fields cannot be blank" )
    return;    
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
      const titleContent = title ? `. ${title}` : '';
  
      this.toastrService.show(
        body,
        titleContent,
        config);
  }
}
