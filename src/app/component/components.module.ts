import { NgModule } from '@angular/core';
// import { TarotRenderComponent } from '../component/tarot-render/tarot-render.component'
import { TablehelpComponent } from '../component/tablehelp/tablehelp.component';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { CommentEditComponent} from '../component/comment-edit/comment-edit.component';
import { BeforeThrowComponent } from '../component/before-throw/before-throw.component';
import { FolderNavComponent } from '../component/folder-nav/folder-nav.component';
import { AssignFolderComponent } from '../component/assign-folder/assign-folder.component';
// import { DroppableComponent } from '../component/droppable/droppable.component'
// import { DraggableComponent } from '../component/draggable/draggable.component'
import { CardSearchComponent } from '../component/card-search/card-search.component';
// import { IonicContextMenuModule } from 'ionic-context-menu';
import { from } from 'rxjs';
// import { DragsupportDirective } from './dragsupport.directive';
// import { BrowserModule } from '@angular/platform-browser';
import { LandingPageComponent } from '../component/landing-page/landing-page.component';
import { ChatItemComponent } from '../component/chat-item/chat-item.component';
import { ReplyCommentComponent } from '../component/reply-comment/reply-comment.component';
import { PopoverMenuComponent } from '../component/popover-menu/popover-menu.component';


@NgModule({
    declarations: [ TablehelpComponent, CommentEditComponent,
        BeforeThrowComponent, FolderNavComponent, AssignFolderComponent,
        CardSearchComponent, LandingPageComponent, ChatItemComponent,
        ReplyCommentComponent, PopoverMenuComponent
         ], // DroppableComponent, DraggableComponent,DragsupportDirective
    exports: [TablehelpComponent, CommentEditComponent, BeforeThrowComponent,
        FolderNavComponent, AssignFolderComponent,
        CardSearchComponent, LandingPageComponent, ChatItemComponent,
        ReplyCommentComponent,  PopoverMenuComponent
        ],  // DroppableComponent, DraggableComponent
    imports: [
        IonicModule,
        CommonModule,
        // BrowserModule,
        FormsModule,
        // IonicContextMenuModule
    ]
})

export class ComponentsModule{}
