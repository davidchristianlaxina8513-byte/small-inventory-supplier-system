
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  
  "graphql_public": {
          Tables: {
            [_ in never]: never
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "graphql":
{ Args: { "extensions"?: Json,"operationName"?: string,"query"?: string,"variables"?: Json }; Returns: Json
                           }
          }
          Enums: {
            [_ in never]: never
          }
          CompositeTypes: {
            [_ in never]: never
          }
        },"public": {
          Tables: {
            "assets": {
                  Row: {
                    "asset_code": string,"condition": Database["public"]['Enums']["asset_condition"],"created_at": string,"id": string,"is_active": boolean,"item_id": string,"location_id": string,"notes": string | null,"office_id": string,"serial_number": string | null,"status": Database["public"]['Enums']["asset_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "asset_code": string,"condition"?: Database["public"]['Enums']["asset_condition"],"created_at"?: string,"id"?: string,"is_active"?: boolean,"item_id": string,"location_id": string,"notes"?: string | null,"office_id": string,"serial_number"?: string | null,"status"?: Database["public"]['Enums']["asset_status"],"updated_at"?: string
                  }
                  Update: {
                    "asset_code"?: string,"condition"?: Database["public"]['Enums']["asset_condition"],"created_at"?: string,"id"?: string,"is_active"?: boolean,"item_id"?: string,"location_id"?: string,"notes"?: string | null,"office_id"?: string,"serial_number"?: string | null,"status"?: Database["public"]['Enums']["asset_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "assets_item_id_office_id_fkey"
      columns: ["item_id","office_id"]
isOneToOne: false
      referencedRelation: "items"
      referencedColumns: ["id","office_id"]
    },{
      foreignKeyName: "assets_location_id_office_id_fkey"
      columns: ["location_id","office_id"]
isOneToOne: false
      referencedRelation: "locations"
      referencedColumns: ["id","office_id"]
    },{
      foreignKeyName: "assets_office_id_fkey"
      columns: ["office_id"]
isOneToOne: false
      referencedRelation: "offices"
      referencedColumns: ["id"]
    }
                  ]
                },"audit_logs": {
                  Row: {
                    "action": string,"actor_id": string | null,"created_at": string,"entity_id": string | null,"entity_type": string,"id": string,"metadata": NonNullable<Json>
                  }
                  ComputedFields: never
                  Insert: {
                    "action": string,"actor_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type": string,"id"?: string,"metadata"?: NonNullable<Json>
                  }
                  Update: {
                    "action"?: string,"actor_id"?: string | null,"created_at"?: string,"entity_id"?: string | null,"entity_type"?: string,"id"?: string,"metadata"?: NonNullable<Json>
                  }
                  Relationships: [
                    {
      foreignKeyName: "audit_logs_actor_id_fkey"
      columns: ["actor_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"categories": {
                  Row: {
                    "created_at": string,"id": string,"is_active": boolean,"name": string,"office_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name": string,"office_id": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name"?: string,"office_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "categories_office_id_fkey"
      columns: ["office_id"]
isOneToOne: false
      referencedRelation: "offices"
      referencedColumns: ["id"]
    }
                  ]
                },"examples": {
                  Row: {
                    "created_at": string,"id": string,"name": string,"updated_at": string,"user_id": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"name": string,"updated_at"?: string,"user_id"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"name"?: string,"updated_at"?: string,"user_id"?: string | null
                  }
                  Relationships: [

                  ]
                },"goods_receipt_items": {
                  Row: {
                    "accepted_quantity": number,"discrepancy_notes": string | null,"goods_receipt_id": string,"id": string,"purchase_order_item_id": string,"received_quantity": number,"rejected_quantity": number | null
                  }
                  ComputedFields: never
                  Insert: {
                    "accepted_quantity": number,"discrepancy_notes"?: string | null,"goods_receipt_id": string,"id"?: string,"purchase_order_item_id": string,"received_quantity": number,"rejected_quantity"?: never
                  }
                  Update: {
                    "accepted_quantity"?: number,"discrepancy_notes"?: string | null,"goods_receipt_id"?: string,"id"?: string,"purchase_order_item_id"?: string,"received_quantity"?: number,"rejected_quantity"?: never
                  }
                  Relationships: [
                    {
      foreignKeyName: "goods_receipt_items_goods_receipt_id_fkey"
      columns: ["goods_receipt_id"]
isOneToOne: false
      referencedRelation: "goods_receipts"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "goods_receipt_items_purchase_order_item_id_fkey"
      columns: ["purchase_order_item_id"]
isOneToOne: false
      referencedRelation: "purchase_order_items"
      referencedColumns: ["id"]
    }
                  ]
                },"goods_receipts": {
                  Row: {
                    "id": string,"notes": string | null,"purchase_order_id": string,"received_at": string,"received_by": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"notes"?: string | null,"purchase_order_id": string,"received_at"?: string,"received_by"?: string
                  }
                  Update: {
                    "id"?: string,"notes"?: string | null,"purchase_order_id"?: string,"received_at"?: string,"received_by"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "goods_receipts_purchase_order_id_fkey"
      columns: ["purchase_order_id"]
isOneToOne: false
      referencedRelation: "purchase_orders"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "goods_receipts_received_by_fkey"
      columns: ["received_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"incidents": {
                  Row: {
                    "asset_id": string | null,"created_at": string,"description": string,"id": string,"incident_type": Database["public"]['Enums']["incident_type"],"item_id": string,"occurred_at": string,"office_id": string,"reported_by": string,"resolution": string | null,"resolved_at": string | null,"resolved_by": string | null,"status": Database["public"]['Enums']["incident_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "asset_id"?: string | null,"created_at"?: string,"description": string,"id"?: string,"incident_type": Database["public"]['Enums']["incident_type"],"item_id": string,"occurred_at": string,"office_id": string,"reported_by"?: string,"resolution"?: string | null,"resolved_at"?: string | null,"resolved_by"?: string | null,"status"?: Database["public"]['Enums']["incident_status"]
                  }
                  Update: {
                    "asset_id"?: string | null,"created_at"?: string,"description"?: string,"id"?: string,"incident_type"?: Database["public"]['Enums']["incident_type"],"item_id"?: string,"occurred_at"?: string,"office_id"?: string,"reported_by"?: string,"resolution"?: string | null,"resolved_at"?: string | null,"resolved_by"?: string | null,"status"?: Database["public"]['Enums']["incident_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "incidents_asset_id_office_id_fkey"
      columns: ["asset_id","office_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id","office_id"]
    },{
      foreignKeyName: "incidents_item_id_office_id_fkey"
      columns: ["item_id","office_id"]
isOneToOne: false
      referencedRelation: "items"
      referencedColumns: ["id","office_id"]
    },{
      foreignKeyName: "incidents_office_id_fkey"
      columns: ["office_id"]
isOneToOne: false
      referencedRelation: "offices"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "incidents_reported_by_fkey"
      columns: ["reported_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "incidents_resolved_by_fkey"
      columns: ["resolved_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"inventory_balances": {
                  Row: {
                    "id": string,"item_id": string,"location_id": string,"office_id": string,"quantity_on_hand": number,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"item_id": string,"location_id": string,"office_id": string,"quantity_on_hand"?: number,"updated_at"?: string
                  }
                  Update: {
                    "id"?: string,"item_id"?: string,"location_id"?: string,"office_id"?: string,"quantity_on_hand"?: number,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "inventory_balances_item_office_fkey"
      columns: ["item_id","office_id"]
isOneToOne: false
      referencedRelation: "items"
      referencedColumns: ["id","office_id"]
    },{
      foreignKeyName: "inventory_balances_location_office_fkey"
      columns: ["location_id","office_id"]
isOneToOne: false
      referencedRelation: "locations"
      referencedColumns: ["id","office_id"]
    }
                  ]
                },"items": {
                  Row: {
                    "category_id": string,"created_at": string,"description": string | null,"id": string,"is_active": boolean,"item_code": string,"name": string,"office_id": string,"reorder_level": number | null,"tracking_type": Database["public"]['Enums']["inventory_tracking_type"],"unit_of_measure": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "category_id": string,"created_at"?: string,"description"?: string | null,"id"?: string,"is_active"?: boolean,"item_code": string,"name": string,"office_id": string,"reorder_level"?: number | null,"tracking_type": Database["public"]['Enums']["inventory_tracking_type"],"unit_of_measure": string,"updated_at"?: string
                  }
                  Update: {
                    "category_id"?: string,"created_at"?: string,"description"?: string | null,"id"?: string,"is_active"?: boolean,"item_code"?: string,"name"?: string,"office_id"?: string,"reorder_level"?: number | null,"tracking_type"?: Database["public"]['Enums']["inventory_tracking_type"],"unit_of_measure"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "items_category_office_fkey"
      columns: ["category_id","office_id"]
isOneToOne: false
      referencedRelation: "categories"
      referencedColumns: ["id","office_id"]
    },{
      foreignKeyName: "items_office_id_fkey"
      columns: ["office_id"]
isOneToOne: false
      referencedRelation: "offices"
      referencedColumns: ["id"]
    }
                  ]
                },"loan_assets": {
                  Row: {
                    "asset_id": string,"condition_at_release": Database["public"]['Enums']["asset_condition"],"condition_at_return": Database["public"]['Enums']["asset_condition"] | null,"id": string,"loan_id": string,"received_by": string | null,"returned_at": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "asset_id": string,"condition_at_release": Database["public"]['Enums']["asset_condition"],"condition_at_return"?: Database["public"]['Enums']["asset_condition"] | null,"id"?: string,"loan_id": string,"received_by"?: string | null,"returned_at"?: string | null
                  }
                  Update: {
                    "asset_id"?: string,"condition_at_release"?: Database["public"]['Enums']["asset_condition"],"condition_at_return"?: Database["public"]['Enums']["asset_condition"] | null,"id"?: string,"loan_id"?: string,"received_by"?: string | null,"returned_at"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "loan_assets_asset_id_fkey"
      columns: ["asset_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "loan_assets_loan_id_fkey"
      columns: ["loan_id"]
isOneToOne: false
      referencedRelation: "loans"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "loan_assets_received_by_fkey"
      columns: ["received_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"loans": {
                  Row: {
                    "borrower_id": string,"created_at": string,"due_at": string,"id": string,"released_at": string,"released_by": string,"request_id": string,"status": Database["public"]['Enums']["loan_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "borrower_id": string,"created_at"?: string,"due_at": string,"id"?: string,"released_at"?: string,"released_by"?: string,"request_id": string,"status"?: Database["public"]['Enums']["loan_status"]
                  }
                  Update: {
                    "borrower_id"?: string,"created_at"?: string,"due_at"?: string,"id"?: string,"released_at"?: string,"released_by"?: string,"request_id"?: string,"status"?: Database["public"]['Enums']["loan_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "loans_borrower_id_fkey"
      columns: ["borrower_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "loans_released_by_fkey"
      columns: ["released_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "loans_request_id_fkey"
      columns: ["request_id"]
isOneToOne: true
      referencedRelation: "requests"
      referencedColumns: ["id"]
    }
                  ]
                },"locations": {
                  Row: {
                    "created_at": string,"id": string,"is_active": boolean,"name": string,"office_id": string,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name": string,"office_id": string,"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name"?: string,"office_id"?: string,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "locations_office_id_fkey"
      columns: ["office_id"]
isOneToOne: false
      referencedRelation: "offices"
      referencedColumns: ["id"]
    }
                  ]
                },"notifications": {
                  Row: {
                    "created_at": string,"id": string,"message": string,"read_at": string | null,"title": string,"type": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"message": string,"read_at"?: string | null,"title": string,"type": string,"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"message"?: string,"read_at"?: string | null,"title"?: string,"type"?: string,"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "notifications_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"offices": {
                  Row: {
                    "created_at": string,"id": string,"is_active": boolean,"name": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"is_active"?: boolean,"name"?: string
                  }
                  Relationships: []
                },"email_verifications": {
                  Row: {
                    "attempts": number,"code_hash": string,"created_at": string,"email": string,"expires_at": string,"id": string,"last_sent_at": string,"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "attempts"?: number,"code_hash": string,"created_at"?: string,"email": string,"expires_at": string,"id"?: string,"last_sent_at"?: string,"user_id": string
                  }
                  Update: {
                    "attempts"?: number,"code_hash"?: string,"created_at"?: string,"email"?: string,"expires_at"?: string,"id"?: string,"last_sent_at"?: string,"user_id"?: string
                  }
                  Relationships: []
                },"profiles": {
                  Row: {
                    "account_status": Database["public"]['Enums']["account_status"],"created_at": string,"email": string | null,"full_name": string,"id": string,"is_verified": boolean,"office_id": string | null,"school_id": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "account_status"?: Database["public"]['Enums']["account_status"],"created_at"?: string,"email"?: string | null,"full_name": string,"id": string,"is_verified"?: boolean,"office_id"?: string | null,"school_id"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "account_status"?: Database["public"]['Enums']["account_status"],"created_at"?: string,"email"?: string | null,"full_name"?: string,"id"?: string,"is_verified"?: boolean,"office_id"?: string | null,"school_id"?: string | null,"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "profiles_office_id_fkey"
      columns: ["office_id"]
isOneToOne: false
      referencedRelation: "offices"
      referencedColumns: ["id"]
    }
                  ]
                },"purchase_order_items": {
                  Row: {
                    "id": string,"item_id": string,"location_id": string,"ordered_quantity": number,"purchase_order_id": string,"received_quantity": number,"unit_cost": number
                  }
                  ComputedFields: never
                  Insert: {
                    "id"?: string,"item_id": string,"location_id": string,"ordered_quantity": number,"purchase_order_id": string,"received_quantity"?: number,"unit_cost": number
                  }
                  Update: {
                    "id"?: string,"item_id"?: string,"location_id"?: string,"ordered_quantity"?: number,"purchase_order_id"?: string,"received_quantity"?: number,"unit_cost"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "purchase_order_items_item_id_fkey"
      columns: ["item_id"]
isOneToOne: false
      referencedRelation: "items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "purchase_order_items_location_id_fkey"
      columns: ["location_id"]
isOneToOne: false
      referencedRelation: "locations"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "purchase_order_items_purchase_order_id_fkey"
      columns: ["purchase_order_id"]
isOneToOne: false
      referencedRelation: "purchase_orders"
      referencedColumns: ["id"]
    }
                  ]
                },"purchase_orders": {
                  Row: {
                    "created_at": string,"id": string,"order_date": string,"order_number": string,"ordered_by": string,"purchase_request_id": string,"status": Database["public"]['Enums']["procurement_status"],"supplier_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"order_date"?: string,"order_number"?: string,"ordered_by"?: string,"purchase_request_id": string,"status"?: Database["public"]['Enums']["procurement_status"],"supplier_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"order_date"?: string,"order_number"?: string,"ordered_by"?: string,"purchase_request_id"?: string,"status"?: Database["public"]['Enums']["procurement_status"],"supplier_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "purchase_orders_ordered_by_fkey"
      columns: ["ordered_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "purchase_orders_purchase_request_id_fkey"
      columns: ["purchase_request_id"]
isOneToOne: false
      referencedRelation: "purchase_requests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "purchase_orders_supplier_id_fkey"
      columns: ["supplier_id"]
isOneToOne: false
      referencedRelation: "suppliers"
      referencedColumns: ["id"]
    }
                  ]
                },"purchase_request_items": {
                  Row: {
                    "estimated_unit_cost": number | null,"id": string,"item_id": string,"purchase_request_id": string,"quantity": number
                  }
                  ComputedFields: never
                  Insert: {
                    "estimated_unit_cost"?: number | null,"id"?: string,"item_id": string,"purchase_request_id": string,"quantity": number
                  }
                  Update: {
                    "estimated_unit_cost"?: number | null,"id"?: string,"item_id"?: string,"purchase_request_id"?: string,"quantity"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "purchase_request_items_item_id_fkey"
      columns: ["item_id"]
isOneToOne: false
      referencedRelation: "items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "purchase_request_items_purchase_request_id_fkey"
      columns: ["purchase_request_id"]
isOneToOne: false
      referencedRelation: "purchase_requests"
      referencedColumns: ["id"]
    }
                  ]
                },"purchase_requests": {
                  Row: {
                    "created_at": string,"id": string,"justification": string,"office_id": string,"reference_number": string,"requested_by": string,"status": Database["public"]['Enums']["procurement_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"justification": string,"office_id": string,"reference_number"?: string,"requested_by"?: string,"status"?: Database["public"]['Enums']["procurement_status"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"justification"?: string,"office_id"?: string,"reference_number"?: string,"requested_by"?: string,"status"?: Database["public"]['Enums']["procurement_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "purchase_requests_office_id_fkey"
      columns: ["office_id"]
isOneToOne: false
      referencedRelation: "offices"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "purchase_requests_requested_by_fkey"
      columns: ["requested_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"request_decisions": {
                  Row: {
                    "created_at": string,"decided_by": string,"decision": Database["public"]['Enums']["decision_type"],"id": string,"reason": string,"request_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"decided_by"?: string,"decision": Database["public"]['Enums']["decision_type"],"id"?: string,"reason": string,"request_id": string
                  }
                  Update: {
                    "created_at"?: string,"decided_by"?: string,"decision"?: Database["public"]['Enums']["decision_type"],"id"?: string,"reason"?: string,"request_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "request_decisions_decided_by_fkey"
      columns: ["decided_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "request_decisions_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    }
                  ]
                },"request_items": {
                  Row: {
                    "approved_quantity": number | null,"id": string,"issued_quantity": number,"item_id": string,"notes": string | null,"request_id": string,"requested_quantity": number
                  }
                  ComputedFields: never
                  Insert: {
                    "approved_quantity"?: number | null,"id"?: string,"issued_quantity"?: number,"item_id": string,"notes"?: string | null,"request_id": string,"requested_quantity": number
                  }
                  Update: {
                    "approved_quantity"?: number | null,"id"?: string,"issued_quantity"?: number,"item_id"?: string,"notes"?: string | null,"request_id"?: string,"requested_quantity"?: number
                  }
                  Relationships: [
                    {
      foreignKeyName: "request_items_item_id_fkey"
      columns: ["item_id"]
isOneToOne: false
      referencedRelation: "items"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "request_items_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    }
                  ]
                },"requests": {
                  Row: {
                    "created_at": string,"id": string,"needed_at": string | null,"office_id": string,"purpose": string,"reference_number": string,"request_type": Database["public"]['Enums']["request_type"],"requester_id": string,"status": Database["public"]['Enums']["request_status"],"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"needed_at"?: string | null,"office_id": string,"purpose": string,"reference_number"?: string,"request_type": Database["public"]['Enums']["request_type"],"requester_id"?: string,"status"?: Database["public"]['Enums']["request_status"],"updated_at"?: string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"needed_at"?: string | null,"office_id"?: string,"purpose"?: string,"reference_number"?: string,"request_type"?: Database["public"]['Enums']["request_type"],"requester_id"?: string,"status"?: Database["public"]['Enums']["request_status"],"updated_at"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "requests_office_id_fkey"
      columns: ["office_id"]
isOneToOne: false
      referencedRelation: "offices"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "requests_requester_id_fkey"
      columns: ["requester_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"reservations": {
                  Row: {
                    "asset_id": string,"created_at": string,"ends_at": string,"id": string,"office_id": string,"purpose": string,"request_id": string | null,"requester_id": string,"starts_at": string,"status": Database["public"]['Enums']["reservation_status"]
                  }
                  ComputedFields: never
                  Insert: {
                    "asset_id": string,"created_at"?: string,"ends_at": string,"id"?: string,"office_id": string,"purpose": string,"request_id"?: string | null,"requester_id"?: string,"starts_at": string,"status"?: Database["public"]['Enums']["reservation_status"]
                  }
                  Update: {
                    "asset_id"?: string,"created_at"?: string,"ends_at"?: string,"id"?: string,"office_id"?: string,"purpose"?: string,"request_id"?: string | null,"requester_id"?: string,"starts_at"?: string,"status"?: Database["public"]['Enums']["reservation_status"]
                  }
                  Relationships: [
                    {
      foreignKeyName: "reservations_asset_id_office_id_fkey"
      columns: ["asset_id","office_id"]
isOneToOne: false
      referencedRelation: "assets"
      referencedColumns: ["id","office_id"]
    },{
      foreignKeyName: "reservations_office_id_fkey"
      columns: ["office_id"]
isOneToOne: false
      referencedRelation: "offices"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reservations_request_id_fkey"
      columns: ["request_id"]
isOneToOne: false
      referencedRelation: "requests"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "reservations_requester_id_fkey"
      columns: ["requester_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"stock_movements": {
                  Row: {
                    "created_at": string,"id": string,"item_id": string,"location_id": string,"movement_type": Database["public"]['Enums']["stock_movement_type"],"office_id": string,"performed_by": string,"quantity": number,"reason": string,"reference": string | null
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"item_id": string,"location_id": string,"movement_type": Database["public"]['Enums']["stock_movement_type"],"office_id": string,"performed_by": string,"quantity": number,"reason": string,"reference"?: string | null
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"item_id"?: string,"location_id"?: string,"movement_type"?: Database["public"]['Enums']["stock_movement_type"],"office_id"?: string,"performed_by"?: string,"quantity"?: number,"reason"?: string,"reference"?: string | null
                  }
                  Relationships: [
                    {
      foreignKeyName: "stock_movements_item_office_fkey"
      columns: ["item_id","office_id"]
isOneToOne: false
      referencedRelation: "items"
      referencedColumns: ["id","office_id"]
    },{
      foreignKeyName: "stock_movements_location_office_fkey"
      columns: ["location_id","office_id"]
isOneToOne: false
      referencedRelation: "locations"
      referencedColumns: ["id","office_id"]
    },{
      foreignKeyName: "stock_movements_performed_by_fkey"
      columns: ["performed_by"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                },"suppliers": {
                  Row: {
                    "address": string | null,"contact_person": string | null,"created_at": string,"email": string | null,"id": string,"is_active": boolean,"name": string,"notes": string | null,"phone": string | null,"updated_at": string
                  }
                  ComputedFields: never
                  Insert: {
                    "address"?: string | null,"contact_person"?: string | null,"created_at"?: string,"email"?: string | null,"id"?: string,"is_active"?: boolean,"name": string,"notes"?: string | null,"phone"?: string | null,"updated_at"?: string
                  }
                  Update: {
                    "address"?: string | null,"contact_person"?: string | null,"created_at"?: string,"email"?: string | null,"id"?: string,"is_active"?: boolean,"name"?: string,"notes"?: string | null,"phone"?: string | null,"updated_at"?: string
                  }
                  Relationships: [

                  ]
                },"user_roles": {
                  Row: {
                    "created_at": string,"id": string,"office_id": string | null,"role": Database["public"]['Enums']["app_role"],"user_id": string
                  }
                  ComputedFields: never
                  Insert: {
                    "created_at"?: string,"id"?: string,"office_id"?: string | null,"role": Database["public"]['Enums']["app_role"],"user_id": string
                  }
                  Update: {
                    "created_at"?: string,"id"?: string,"office_id"?: string | null,"role"?: Database["public"]['Enums']["app_role"],"user_id"?: string
                  }
                  Relationships: [
                    {
      foreignKeyName: "user_roles_office_id_fkey"
      columns: ["office_id"]
isOneToOne: false
      referencedRelation: "offices"
      referencedColumns: ["id"]
    },{
      foreignKeyName: "user_roles_user_id_fkey"
      columns: ["user_id"]
isOneToOne: false
      referencedRelation: "profiles"
      referencedColumns: ["id"]
    }
                  ]
                }
          }
          Views: {
            [_ in never]: never
          }
          Functions: {
            "can_approve_office_workflow":
{ Args: { "target_office_id": string }; Returns: boolean
                           },
"can_manage_inventory_office":
{ Args: { "target_office_id": string }; Returns: boolean
                           },
"can_manage_office_workflow":
{ Args: { "target_office_id": string }; Returns: boolean
                           },
"can_view_inventory_office":
{ Args: { "target_office_id": string }; Returns: boolean
                           },
"create_purchase_order":
{ Args: { "p_item_id": string,"p_location_id": string,"p_purchase_request_id": string,"p_quantity": number,"p_supplier_id": string,"p_unit_cost": number }; Returns: string
                           },
"create_purchase_request":
{ Args: { "p_estimated_unit_cost"?: number,"p_item_id": string,"p_justification": string,"p_office_id": string,"p_quantity": number }; Returns: string
                           },
"create_request":
{ Args: { "p_item_id": string,"p_needed_at": string,"p_notes"?: string,"p_office_id": string,"p_purpose": string,"p_quantity": number,"p_request_type": Database["public"]['Enums']["request_type"] }; Returns: string
                           },
"create_reservation":
{ Args: { "p_asset_id": string,"p_ends_at": string,"p_purpose": string,"p_request_id"?: string,"p_starts_at": string }; Returns: string
                           },
"decide_request":
{ Args: { "p_approved_quantities"?: Json,"p_decision": Database["public"]['Enums']["decision_type"],"p_reason": string,"p_request_id": string }; Returns: Database["public"]['Enums']["request_status"]
                           },
"get_item_movements":
{ Args: { "target_item_id": string }; Returns: {
              "created_at": string,"id": string,"movement_type": Database["public"]['Enums']["stock_movement_type"],"performed_by": string,"performed_by_name": string,"quantity": number,"reason": string,"reference": string
            }[]
                           },
"get_reservable_assets":
{ Args: Record<PropertyKey, never>; Returns: {
              "asset_code": string,"condition": Database["public"]['Enums']["asset_condition"],"id": string,"item_id": string,"office_id": string,"status": Database["public"]['Enums']["asset_status"]
            }[]
                           },
"has_office_role":
{ Args: { "required_roles": (Database["public"]['Enums']["app_role"])[],"target_office_id": string }; Returns: boolean
                           },
"has_role":
{ Args: { "required_role": Database["public"]['Enums']["app_role"] }; Returns: boolean
                           },
"is_active_user":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"is_admin":
{ Args: Record<PropertyKey, never>; Returns: boolean
                           },
"issue_request_item":
{ Args: { "p_location_id": string,"p_quantity": number,"p_request_item_id": string }; Returns: string
                           },
"receive_purchase_item":
{ Args: { "p_accepted": number,"p_notes"?: string,"p_purchase_order_item_id": string,"p_received": number }; Returns: string
                           },
"record_stock_movement":
{ Args: { "p_item_id": string,"p_location_id": string,"p_movement_type": Database["public"]['Enums']["stock_movement_type"],"p_quantity": number,"p_reason": string,"p_reference"?: string }; Returns: {
              "movement_id": string,"quantity_on_hand": number
            }[]
                           },
"release_loan":
{ Args: { "p_asset_ids": (string)[],"p_due_at": string,"p_request_id": string }; Returns: string
                           },
"resolve_incident":
{ Args: { "p_asset_condition"?: Database["public"]['Enums']["asset_condition"],"p_incident_id": string,"p_resolution": string }; Returns: undefined
                           },
"return_loan_asset":
{ Args: { "p_condition": Database["public"]['Enums']["asset_condition"],"p_loan_asset_id": string }; Returns: undefined
                           },
"transfer_stock":
{ Args: { "p_from_location_id": string,"p_item_id": string,"p_quantity": number,"p_reason": string,"p_to_location_id": string }; Returns: undefined
                           },
"write_audit":
{ Args: { "p_action": string,"p_entity_id": string,"p_entity_type": string,"p_metadata"?: Json }; Returns: undefined
                           }
          }
          Enums: {
            "account_status": "pending"|"active"|"suspended","app_role": "student"|"teacher"|"non_teaching"|"office_staff"|"office_head"|"admin","asset_condition": "good"|"fair"|"damaged"|"missing"|"under_repair"|"disposed","asset_status": "available"|"reserved"|"on_loan"|"unavailable"|"disposed","decision_type": "approve"|"partially_approve"|"reject"|"needs_clarification","incident_status": "reported"|"under_review"|"resolved","incident_type": "damage"|"missing","inventory_tracking_type": "serialized_asset"|"quantity_stock","loan_status": "active"|"partially_returned"|"returned","procurement_status": "draft"|"submitted"|"approved"|"rejected"|"ordered"|"partially_received"|"received"|"cancelled","request_status": "draft"|"submitted"|"under_review"|"needs_clarification"|"approved"|"partially_approved"|"rejected"|"cancelled"|"completed","request_type": "borrow"|"consumable"|"reservation"|"purchase"|"other","reservation_status": "pending"|"approved"|"cancelled"|"completed"|"expired","stock_movement_type": "receipt"|"issue"|"adjustment_in"|"adjustment_out"|"return"|"transfer_in"|"transfer_out"|"damage"|"disposal"
          }
          CompositeTypes: {
            [_ in never]: never
          }
        }
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
  ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
      Row: infer R
    }
    ? R
    : never
  : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Insert: infer I
    }
    ? I
    : never
  : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never
> = DefaultSchemaTableNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
  ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
      Update: infer U
    }
    ? U
    : never
  : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
  ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
  : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never
> = PublicCompositeTypeNameOrOptions extends { schema: keyof DatabaseWithoutInternals }
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
  ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
  : never

export const Constants = {
  "graphql_public": {
          Enums: {
            
          }
        },"public": {
          Enums: {
            "account_status": ["pending", "active", "suspended"],"app_role": ["student", "teacher", "non_teaching", "office_staff", "office_head", "admin"],"asset_condition": ["good", "fair", "damaged", "missing", "under_repair", "disposed"],"asset_status": ["available", "reserved", "on_loan", "unavailable", "disposed"],"decision_type": ["approve", "partially_approve", "reject", "needs_clarification"],"incident_status": ["reported", "under_review", "resolved"],"incident_type": ["damage", "missing"],"inventory_tracking_type": ["serialized_asset", "quantity_stock"],"loan_status": ["active", "partially_returned", "returned"],"procurement_status": ["draft", "submitted", "approved", "rejected", "ordered", "partially_received", "received", "cancelled"],"request_status": ["draft", "submitted", "under_review", "needs_clarification", "approved", "partially_approved", "rejected", "cancelled", "completed"],"request_type": ["borrow", "consumable", "reservation", "purchase", "other"],"reservation_status": ["pending", "approved", "cancelled", "completed", "expired"],"stock_movement_type": ["receipt", "issue", "adjustment_in", "adjustment_out", "return", "transfer_in", "transfer_out", "damage", "disposal"]
          }
        }
} as const
