// One pointer owns the hold; cancellation never commits a placement.
export class HoldInput {
 constructor(){this.id=null;this.moved=false;}
 begin(id){if(this.id!==null)return false;this.id=id;this.moved=false;return true;}
 markMoved(amount){if(this.id!==null&&amount>.012)this.moved=true;}
 finish(id,cancel=false){if(id!==this.id)return null;let commit=this.moved&&!cancel;this.id=null;this.moved=false;return {commit};}
}
