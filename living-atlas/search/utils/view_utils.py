from django.http import HttpResponse, JsonResponse

# All lemma keys are of the form {lemma}@{group}@.
# All form keys are of the form {lemma}@{group}@{form}
# and have value {group}@{form}.
# The "@" symbol will not appear in any other key,
# and the "@" symbol will only appear in the value if the
# checkbox corresponds to a form

def render_to_carto_response(request):

    json_data = {}

    for key in request.POST:
        if "@" not in key: 
            continue
        value = request.POST[key]
        if "@" not in value:
            continue
        group, form = value.split("@")
        
        json_data.setdefault(group, []).append(form)

    return JsonResponse(json_data, status=200)

from openpyxl import Workbook

def render_to_excel_response(request):

    response = HttpResponse()
    response['Content-Type'] = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    response['Content-Disposition'] = f'attachment; filename=living-atlas.xlsx'

    workbook = Workbook()
    worksheet = workbook.active
    worksheet.title = "living-atlas-export"

    columns = {'form'  : 1, 
               'lemma' : 2, 
               'latin' : 3, 
               'group' : 4,}

    # Create the column names
    for col_name, col_idx in columns.items():
        cell = worksheet.cell(row = 1, column = col_idx)
        cell.value = col_name

    # Insert the row values
    row_idx = 2
    for key in request.POST:
        data = key.split("@")
        if data != 4:
            continue

        lemma, latin, group, form = data
        row_values = {'form':form, 'lemma':lemma, 'latin':latin, 'group':group}

        for col_name, row_value in row_values.items():
            cell = worksheet.cell(row = row_idx, column = columns[col_name])
            cell.value = row_value
        row_idx += 1

    workbook.save(response)
    return response