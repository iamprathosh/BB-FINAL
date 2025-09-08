import pandas as pd
import os
import sys
from pathlib import Path

def convert_excel_to_csv(excel_file_path, output_dir="csv_data"):
    """
    Convert all sheets of an Excel file to separate CSV files
    """
    try:
        # Create output directory if it doesn't exist
        Path(output_dir).mkdir(parents=True, exist_ok=True)
        
        # Read all sheets from Excel file
        excel_file = pd.ExcelFile(excel_file_path)
        
        print(f"Found {len(excel_file.sheet_names)} sheets in {excel_file_path}")
        print("Sheets:", excel_file.sheet_names)
        
        csv_files = []
        
        for sheet_name in excel_file.sheet_names:
            # Read the sheet
            df = pd.read_excel(excel_file_path, sheet_name=sheet_name)
            
            # Clean sheet name for filename
            clean_sheet_name = sheet_name.replace(" ", "_").replace("/", "_").replace("\\", "_")
            csv_filename = f"{clean_sheet_name}.csv"
            csv_path = os.path.join(output_dir, csv_filename)
            
            # Convert to CSV
            df.to_csv(csv_path, index=False, encoding='utf-8')
            
            print(f"✓ Converted '{sheet_name}' to '{csv_filename}' ({len(df)} rows, {len(df.columns)} columns)")
            
            # Preview first few rows
            print(f"  Columns: {list(df.columns)}")
            print(f"  Sample data: {df.head(1).to_dict('records') if not df.empty else 'No data'}")
            print()
            
            csv_files.append({
                'sheet_name': sheet_name,
                'csv_file': csv_path,
                'rows': len(df),
                'columns': list(df.columns)
            })
        
        return csv_files
        
    except Exception as e:
        print(f"Error converting Excel file: {e}")
        return None

def main():
    # Set the base directory
    base_dir = Path(__file__).parent.parent
    
    # Excel files to convert
    excel_files = [
        "B&B Inventory_Master_List.xlsx",
        "Vendor Database.xlsx"
    ]
    
    all_csv_files = []
    
    for excel_file in excel_files:
        excel_path = base_dir / excel_file
        
        if excel_path.exists():
            print(f"\n{'='*60}")
            print(f"Converting: {excel_file}")
            print(f"{'='*60}")
            
            csv_files = convert_excel_to_csv(str(excel_path), "csv_data")
            if csv_files:
                all_csv_files.extend(csv_files)
        else:
            print(f"❌ Excel file not found: {excel_path}")
    
    # Summary
    print(f"\n{'='*60}")
    print("CONVERSION SUMMARY")
    print(f"{'='*60}")
    print(f"Total CSV files created: {len(all_csv_files)}")
    
    for csv_info in all_csv_files:
        print(f"  - {csv_info['csv_file']} ({csv_info['rows']} rows)")

if __name__ == "__main__":
    main()
